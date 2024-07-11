@isTest
public class ProductControllerTest {
    
    @testSetup
    static void setup() {
        // Ensure there is a standard pricebook
            Pricebook2 standardPricebook;
            Id pricebookId = Test.getStandardPricebookId();
             standardPricebook = new Pricebook2(
                Id = pricebookId,
                IsActive = true
            );
            update standardPricebook;
        
        // Create Products and PricebookEntries
        List<Product2> products = new List<Product2>();
        List<PricebookEntry> pricebookEntries = new List<PricebookEntry>();
        
        for (Integer i = 0; i < 200; i++) {
            Product2 prod = new Product2(Name = 'Test Product ' + i, Family = 'Test Family', ProductCode='GTest'+i, Description='Test class'+i);
            products.add(prod);
        }
        insert products;
        
        for (Product2 prod : products) {
            PricebookEntry pbe = new PricebookEntry(
                Pricebook2Id = standardPricebook.Id,
                Product2Id = prod.Id,
                UnitPrice = 100,
                IsActive = true
            );
            pricebookEntries.add(pbe);
        }
        insert pricebookEntries;
        
        // Create an Opportunity
        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity',
            StageName = 'Prospecting',
            CloseDate = Date.today(),
            Product_Added__c = false
        );
        insert opp;
    }

    @isTest
    static void testGetProducts() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        ProductController.prodWrapperClass result = ProductController.getProducts(opp.Id);
        Test.stopTest();
        
        // Assert the result
        System.assertNotEquals(null, result);
        System.assertEquals(200, result.prodEntriesMap.size());
    }
    
    @isTest
    static void testSearchProductByName() {
        Test.startTest();
        ProductController.prodWrapperClass result = ProductController.searchProductByName('Test Product');
        Test.stopTest();
        
        // Assert the result
        System.assertNotEquals(null, result);
        System.assertEquals(200, result.prodEntriesMap.size());
    }
    
    @isTest
    static void testCreateOpportunityLine() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        List<PricebookEntry> pbEntries = [SELECT Id, Product2Id, UnitPrice FROM PricebookEntry LIMIT 200];
        
        List<ProductController.ProductWrapper> productWrappers = new List<ProductController.ProductWrapper>();
        for (PricebookEntry pbe : pbEntries) {
            ProductController.ProductWrapper pw = new ProductController.ProductWrapper();
            pw.entries = new ProductController.ProductWrapperEntries();
            pw.entries.Product2Id = pbe.Product2Id;
            pw.entries.Id = pbe.Id;
            pw.entries.UnitPrice = pbe.UnitPrice;
            pw.oppId = opp.Id;
            pw.qty = '1';
            pw.getdate = String.valueOf(Date.today());
            pw.linedes = 'Test Line Item';
            productWrappers.add(pw);
        }
        
        String jsonData = JSON.serialize(productWrappers);
        
        Test.startTest();
        Boolean result = ProductController.createOpportunityline(jsonData);
        Test.stopTest();
        
        // Assert the result
        System.assertEquals(true, result);
        
        List<OpportunityLineItem> oliList = [SELECT Id, OpportunityId FROM OpportunityLineItem WHERE OpportunityId = :opp.Id];
        System.assertEquals(200, oliList.size());
    }
}