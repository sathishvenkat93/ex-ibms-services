export const dbConfig = {
    // Configuration for Database 1
    db: {
      users: {
        name: 'USERS',
        employees: {
          collection: 'employees'
        },
      },
      billing:{
        name: 'BILLING',
        collection: {
          billing: 'billing',
          shipTo: 'shipTo'
        }
      },
      inventory: {
        name: 'INVENTORY',
        collection: {
          inventory: 'productInventory',
          sku: 'sku'
        },
        sku:{
          collection:'sku'
        },
        pricing: {
          collection: 'pricing'
        },
        discounts: {
          collection: 'discounts'
        },
        // productImages: {
        //   collection: 'productImages'
        // },

      },
      organisation: {
        name: 'ORGANISATION',
        orgDetails: {
          collection: 'orgConfigs'
        },
        orgEmployees: {
          collection: 'orgEmployee-association'
        }
      }
    },
  
  
    // Add more databases if needed
  };
  