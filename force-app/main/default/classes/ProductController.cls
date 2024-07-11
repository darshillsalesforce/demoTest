public class ProductController {
    
    
    
    @AuraEnabled(cacheable=true)
    public static prodWrapperClass getProducts(string oppId) 
    {
        Set<Id> prodIdSet = new Set<Id>();
        map<Product2, List<pricebookEntry>> prodPricebookMap = new map<Product2, List<pricebookEntry>>();
        
        Boolean ProdAdded = [SELECT Product_Added__c From Opportunity where Id =: oppId].Product_Added__c;
        
        List<Product2> prodList = [SELECT Id, Name, ProductCode, Description, Family FROM Product2];
        
        For(Product2 prod : prodList)
        {
            prodIdSet.add(prod.Id);
        }
        
        List<pricebookEntry> pBList = [SELECT Product2Id, UnitPrice FROM PricebookEntry Where Product2Id In : prodIdSet];
        prodWrapperClass wrapObj = new prodWrapperClass();
        For(Product2 prod : prodList)
        {
            
            For(pricebookEntry pB: pBList)
            {
                
                If(pB.Product2Id == prod.Id)
                {
                    if(!prodPricebookMap.containsKey(prod))
                    {
                        prodPricebookMap.put(prod, new List<pricebookEntry>());
                    }
                    prodPricebookMap.get(prod).add(pB);
                }
            }
        }
        wrapObj.prodEntriesMap = prodPricebookMap;
        wrapObj.prodAddedWrap = ProdAdded;
        
        return wrapObj;
    }
    
    @AuraEnabled
    public static prodWrapperClass searchProductByName(string prodName)
    {
        string prodKey = prodName +'%';
        
        Set<Id> prodIdSet = new Set<Id>();
        map<Product2, List<pricebookEntry>> prodPricebookMap = new map<Product2, List<pricebookEntry>>();
        
        List<Product2> prodList = [SELECT Id, Name, ProductCode, Description, Family FROM Product2 where Name like: prodKey];
        system.debug('Prod size '+prodList.size());
        
        For(Product2 prod : prodList)
        {
            prodIdSet.add(prod.Id);
        }
        
        List<pricebookEntry> pBList = [SELECT Product2Id, UnitPrice FROM PricebookEntry Where Product2Id In : prodIdSet];
        prodWrapperClass wrapObj = new prodWrapperClass();
        For(Product2 prod : prodList)
        {
            
            For(pricebookEntry pB: pBList)
            {
                
                If(pB.Product2Id == prod.Id)
                {
                    if(!prodPricebookMap.containsKey(prod))
                    {
                        prodPricebookMap.put(prod, new List<pricebookEntry>());
                    }
                    prodPricebookMap.get(prod).add(pB);
                }
            }
        }
        wrapObj.prodEntriesMap = prodPricebookMap;
        return wrapObj;
    }
    
    @AuraEnabled
    public static Boolean createOpportunityline(String jsonData) {
        
        System.debug('jsonData :'+jsonData);
        List<ProductWrapper> productWrappers = (List<ProductWrapper>) JSON.deserialize(jsonData, List<ProductWrapper>.class);
        List<OpportunityLineItem> oppLineList = new List<OpportunityLineItem>();
        
        for (ProductWrapper wrapper : productWrappers) {
            OpportunityLineItem oppLine = new OpportunityLineItem();
            oppLine.Product2Id = wrapper.entries.Product2Id;
            oppLine.OpportunityId = wrapper.oppId;
            oppLine.PricebookEntryId = wrapper.entries.Id;
            oppLine.UnitPrice = wrapper.entries.UnitPrice;
            oppLine.Quantity = Integer.valueOf(wrapper.qty); // Convert qty to Integer
            oppLine.Description = wrapper.linedes;
            oppLineList.add(oppLine);
            
           	System.debug('oppLine :'+oppLine);
        }
        
        if (!oppLineList.isEmpty()) {
            insert oppLineList;
            updateOpportunity(oppLineList[0].OpportunityId);
            return true;
        }
        return false;
        
    }
    
    public static void updateOpportunity(String oppId)
    {
        List<Opportunity> oppList = new List<Opportunity>();
        Opportunity oppObj = [SELECT Product_Added__c From Opportunity where Id =: oppId];
        if(oppObj!=null)
        {
            oppObj.Product_Added__c = true;
            oppList.add(oppObj);
        }
        if(oppList.size()>0)
        {
            UPDATE oppList;
        }
    }
    
    Public Class prodWrapperClass
    {
        @AuraEnabled public map<Product2, List<pricebookEntry>> prodEntriesMap {get; set;}
        @AuraEnabled public boolean prodAddedWrap {get; set;}
    }
    
    public class ProductWrapper {
        /*@AuraEnabled
        public ProductWrapperProduct product { get; set; }*/
        
        @AuraEnabled
        public ProductWrapperEntries entries { get; set; }
        
        @AuraEnabled public String oppId { get; set; }
        
        @AuraEnabled
        public String qty { get; set; }
        
        @AuraEnabled
        public String getdate { get; set; }
        
        @AuraEnabled
        public String linedes { get; set; }
    }
    
    /*public class ProductWrapperProduct {
        @AuraEnabled
        public String Id { get; set; }
        
        @AuraEnabled
        public String Name { get; set; }
        
        @AuraEnabled
        public String ProductCode { get; set; }
    }*/
    
    public class ProductWrapperEntries {
        @AuraEnabled
        public String Product2Id { get; set; }
        
        @AuraEnabled
        public Decimal UnitPrice { get; set; }
        
        @AuraEnabled
        public String Id { get; set; }
    }
    
    
    
}