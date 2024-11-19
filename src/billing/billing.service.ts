import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { dbConfig } from "../configs/appConfig"
import { InventoryService } from "../inventory/inventory.service"
import { getDBConnection } from "../utils/database"
import DocSequence, { Doc } from "../utils/docSequencing"
import { InboundDataMisMatchException, StockUnitsNotAvailable } from "../utils/exceptionhandler"
import { createRecordSuccessMessage } from "../utils/messages"
import { createAPIReponse } from "../utils/responseObjects"
import { CreateInvoice, SkuStatus } from "./billing.dto"
import { Billing } from "./billing.entity"
import path from "path"
import nodemailer from 'nodemailer'
import { promises as fs } from 'fs';

export class BillingService{
    private dbConnPromise: Promise<any>
    private billingRepository: Promise<any>
    // private inventoryRepository: Promise<any>
    inventoryService: InventoryService

    constructor(){
        this.dbConnPromise = this.initDBConnection()
        this.billingRepository = this.getRepositories(dbConfig.db.billing.collection.billing)
        // this.inventoryRepository = this.getRepositories(dbConfig.db.inventory.collection.inventory)
        this.inventoryService = new InventoryService();
    }
    private async initDBConnection(){
        try{
            console.info('Billing DB init()...')
            return await getDBConnection(dbConfig.db.billing.name)
        }catch(error){
            console.error(error)
            throw new Error(`Caught DB Connection Constructor error: ${error}`)
        }
    }

    private async getRepositories(collection: any){
        console.log("callingBilling Repos...",collection)
        const dbConn = await this.dbConnPromise
        return await dbConn.collection(collection)
    }

    // GET all invoices api
    async getAllInvoices(){
        const collection = await this.billingRepository
        const records = await collection.find({}).toArray()
        return records
    }

    //GET invoice by ID
    async getInvoiceById(billingId: string){
        const collection = await this.billingRepository
        const record = await collection.find({ billingId: billingId }).toArray()
        return record
    }

    //Update Status of an Invoice
    async updateInvoiceStatus(billingId: string, status: string){
        const collection = await this.billingRepository
        try{
            await collection.findOneAndUpdate(
                {billingId: billingId},
                {
                    $set: {
                        status: status,
                        updatedAt: new Date()
                    }
                },
                { returnOriginal: false }
            )
            return await collection.find({billingId: billingId}).toArray()
        }catch(error){
            throw new Error(`Problem processing Request ${error}`)
        }
    }

    async fetchProductDetails(productId: string) {
        const record = await this.inventoryService.getInventorybyID(productId)
        return record
      }
    

    async processSKUs(productDetails: any, particularUnits: number) {
        const skuStatusArray = [];
      
        for (const sku of productDetails.SKU) {
          const [modelId, reqUnits] = sku.split(":")
          const modelDetails = await this.inventoryService.getStockUnitbyID(modelId);
          const inStock = modelDetails[0].inStock;
      
          skuStatusArray.push({
            modelId,
            requiredUnits: reqUnits * particularUnits,
            inStock,
          });
      
          
        }
      
        return skuStatusArray;
      }

    async createInvoice(body: CreateInvoice){
        const billing = new Billing
        const skuStatusArrays: SkuStatus[] = [];
        let result: any
        try{
        billing.billingId = await DocSequence.getNextIndexOf(Doc.INVOICE)
        billing.billName = body.billName
        billing.contactNo = body.contactNo || ''
        billing.emailAddress = body.emailAddress || ''
        billing.billAddress = body.billAddress

        const particularsWithDetails = await Promise.all(
            body.particulars.map(async (particular) => {
              const productDetails = await this.fetchProductDetails(particular.productId);
              const amount = particular.rate * particular.units;
              const result = await this.processSKUs(productDetails[0], particular.units)
              skuStatusArrays.push(...result)
              return {
                ...particular,
                productName: productDetails ? productDetails[0].productName : 'Unknown',
                amount
              };
            })
          );
        
        billing.total = particularsWithDetails.reduce((acc, item) => acc + item.amount, 0);
        billing.particulars = particularsWithDetails
        billing.status = body.status || ''
        billing.generatedAt = new Date()
        const flag = !skuStatusArrays.some(sku => !sku.inStock);
        
        if(!flag){
            return createAPIReponse(207,'Stock Not Available')
        }else{
            const collection = await this.billingRepository
            // console.log("what do we have here?:",skuStatusArrays)

            //update SKU units
            for(const sku of skuStatusArrays){
                const unitsUpdate = await this.inventoryService.updateSKUnits(sku.modelId,sku.requiredUnits)
                if(!unitsUpdate){
                    throw new InboundDataMisMatchException(`Problem Processing Request while updating units`)
                }
            }
            const pdfPath = await this.generatePDFInvoice(billing)
        
            //doc path saving
            billing.docPath = pdfPath

            if(body.emailAddress){
                await this.sendInvoiceEmail(body.emailAddress,pdfPath)
            }

            // console.log(billing)
            await collection.insertOne(billing)

            return createAPIReponse(201,createRecordSuccessMessage)
        }
        }catch(error){
            throw new InboundDataMisMatchException(`Problem Processing Request ${error}`)
        }
    }

    private async generatePDFInvoice(billing: Billing): Promise<string> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;
        const address = billing.billAddress
        const addressText = `${address.doorNumber}, ${address.address1}, ${address.address2}, ${address.city}, ${address.state}, ${address.zipcode}`;
        const lines = addressText.split(',')
        const maxX=550
        const startX = 400
        let startY = 700
        let currentY = startY
        for (const line of lines) {
            // If the line exceeds the maximum width, split it into multiple lines
            const lineFragments = page.drawText(line, {
                x: startX,
                y: currentY,
                size: fontSize,
                color: rgb(0, 0, 0), // Black color
            });
    
            // Move to the next line
            currentY -= lineHeight;
            if (currentY < 50) {
                // Start a new page if the next line exceeds the boundary
                const newPage = pdfDoc.addPage();
                currentY = startY;
            }
        }
        currentY -= 50
        page.drawText(`Sera - IBMS - INVOICE TEST`,{x: 250, y: 750,size: fontSize})
        page.drawText(`Invoice for ${billing.billName},    Ph: ${billing.contactNo}`, { x: 50, y: 700, size: fontSize });
        page.drawText(`email: ${billing.emailAddress}`, {x: 50, y:680, size: fontSize})
        const font = await pdfDoc.embedFont('Helvetica-Bold');
        page.drawText(`Total: ${billing.total}`, { x: 50, y: 50, size:fontSize, font });
        page.drawText(`Signature: ${billing.status}`, { x: 500, y: 80, size: fontSize });
    

        const columnWidths = [50, 200, 350, 400, 450]; // Adjust the widths as needed

            // Define column headers
            const headers = ['Product Code', 'Product Name', 'Rate', 'Unit', 'Amount'];

            // Draw column headers
            for (let i = 0; i < headers.length; i++) {
                page.drawText(headers[i], { x: columnWidths[i], y: currentY, size: fontSize });
            }

            // Move to the next line
            currentY -= lineHeight;

            // Draw particulars
            for (const particular of billing.particulars) {
                const particularText = `${particular.productId},${particular.productName},${particular.rate},${particular.units},${particular.amount}`;
                const columns = particularText.split(',');

                // Draw each column
                for (let i = 0; i < columns.length; i++) {
                    page.drawText(columns[i], { x:columnWidths[i], y: currentY, size: fontSize });
                }

                // Move to the next line
                currentY -= lineHeight;
            }
    
        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join('/Users/sathishvenkat/Desktop/Invoices', `/invoice_${billing.billingId}.pdf`);
        console.log("PDF PATH....", pdfPath)
        await fs.writeFile(pdfPath, pdfBytes);
        return pdfPath;
    }

    
    

    private async sendInvoiceEmail(emailAddress: string, pdfPath: string) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587, 
            secure: false, 
            auth: {
                user: 'your-email@address.com', 
                pass: 'password@123' 
        }
        });
    
        const mailOptions = {
            from: 'joshcreatives@outlook.com',
            to: emailAddress,
            subject: 'Your Invoice',
            text: 'Please find attached your invoice.',
            attachments: [
                {
                    filename: path.basename(pdfPath),
                    path: pdfPath
                }
            ]
        };
    
        await transporter.sendMail(mailOptions);
    }


}
