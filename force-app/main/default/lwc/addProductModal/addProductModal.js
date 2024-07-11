import { LightningElement, track ,wire, api} from 'lwc';
import getProducts from '@salesforce/apex/ProductController.getProducts';
import searchProductByName from '@salesforce/apex/ProductController.searchProductByName';
import createOpportunityline from '@salesforce/apex/ProductController.createOpportunityline';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class AddProductModal extends LightningElement {
    @track isModalOpen = false;
    @track isModal2Open = false;
    @track selectedValuesCount = 0 ;
    @track finalData = [];
    @track copyOffinalData = [];
    @track showSpinner =false;
    selectedValues =[];
    selectedRecords = [];
    @track productWithPricebook = [];
    
    searchProductKey = '';
    map;
    productAdded;
    Values;
    selectAll;
    @api recordId;

    @wire(getProducts,{oppId : '$recordId'})
    wiredProducts({ error, data }) {
        
        if (data) {
        console.log('data- ',data.prodEntriesMap);
        this.productAdded = data.prodAddedWrap;
        this.map = data.prodEntriesMap;
        if(this.productAdded)
        {
            this.isModalOpen = false;
        }
        else{
            this.isModalOpen = true;
        }
        for(let key in this.map)
        {

            this.finalData.push({
                'oppId'   : this.recordId,
                'product' : this.addProperties(key)[0],
                'entries' : this.addProperties(key)[1],
                'isChecked': false,
                'qty' : 0,
                'date':'',
                'linedes':''
            })
        }

        this.copyOffinalData = this.finalData;
        
        console.log('finalData ', this.finalData[0].product.Id)
        console.log('product ', this.finalData[0].entries.UnitPrice)
        
        this.error = undefined;
        }
         else if (error) 
         {
            console.log('error', error);
            this.error = error;
            
        }
    }

    parseStringToObject(str) {
        // Extract the part within parentheses
        const dataString = str.match(/\(([^)]+)\)/)[1];

        // Split the string into key-value pairs
        const keyValuePairs = dataString.split(', ');

        // Create the object
        const obj = {};
        keyValuePairs.forEach(pair => {
            console.log('pair :',pair);

            const [key, ...rest] = pair.split(':');
            const value = rest.join(':');

            //const [key, value] = pair.split(':');
            obj[key.trim()] = value.trim();
        });

        return obj;
    }

    addProperties(key) {
        // Parse the string to an object
        const product = this.parseStringToObject(key);
        var resultArray = [];
        resultArray.push( product);
        console.log('product ', resultArray[0])

        // Collect the properties from this.map[key] into temparr
        
        for (let innerkey in this.map[key]) {
            resultArray.push(this.map[key][innerkey]);
        }
        console.log('temp ', resultArray[1])
        return resultArray;
    }

    handleAllSelected(event) {
        this.selectAll =  event.target.checked;
    console.log('selectAll',this.selectAll);
    let selectedRows = this.template.querySelectorAll('lightning-input[data-name = "allSelected"]');
        console.log('selectedRows ', selectedRows.length);
        for(let i = 0; i < selectedRows.length; i++) {
             
            if(selectedRows[i].type === 'checkbox') {
                selectedRows[i].checked = event.target.checked;
                
            }
        }
         
    if(event.target.checked)
    {
        this.selectedValuesCount = selectedRows.length;
        console.log('checked ', this.selectedValuesCount);
        for(let i=0; i<this.finalData.length; i++)
        {
            this.finalData[i].isChecked = true;
            this.selectedValues.push(this.finalData[i].product.Id);
        }
        console.log('All selected values ',JSON.stringify(this.selectedValues));
        console.log('All checked values ',JSON.stringify(this.finalData));
    }
    else{
         this.selectedValues = [];
        this.selectedValuesCount =  0;
        console.log('All selected values ',JSON.stringify(this.selectedValues));
    }
    
}

    handleCheckboxSelect(event)
    {
        this.selectedValues = [];
        console.log('handle check', event.target.checked);
        console.log('Id ',event.currentTarget.dataset.id);
        let unselectedRec = event.currentTarget.dataset.id;
        this.Values =  event.currentTarget.dataset.id;
        console.log('value ',  this.Values)
        if (event.target.checked) {
            
            for(let i=0; i<this.finalData.length; i++)
            {
                if(this.Values == this.finalData[i].product.Id)
                {
                    console.log('value check 1',  this.finalData[i].isChecked )
                    this.finalData[i].isChecked = true;
                    console.log('value affter check 1',  this.finalData[i].isChecked )
                }
                
            }
            for(let i=0; i<this.finalData.length; i++)
            {
                if(this.finalData[i].isChecked)
                {
                    
                    this.selectedValues.push( this.finalData[i].product.Id);
                }
            }
            

        } 
        else if(!event.target.checked)
        {
            try {
                for(let i=0; i<this.finalData.length; i++)
                {
                    if(this.Values == this.finalData[i].product.Id)
                    {
                        console.log('value check 2',  this.finalData[i].isChecked )
                        this.finalData[i].isChecked = false;
                        console.log('value affter check 2',  this.finalData[i].isChecked )
                    }
                    
                }

               for(let i=0; i<this.finalData.length; i++)
                {
                    if(this.finalData[i].isChecked)
                    {
                        
                        this.selectedValues.push( this.finalData[i].product.Id);
                    }
                    console.log('after uncheck selected values ', this.selectedValues)
                }
                } catch (err) {
                    console.log('error handle uncheck', err)
                }
        }
        else if(this.selectAll && (!event.target.checked))
        {
            console.log('row unselected ', event.target.checked)
            try {
                this.index = this.selectedValues.indexOf( unselectedRec);
                console.log('index of unselected row ', this.index);
                this.selectedValues.splice(this.index, 1);
                 for(let i=0; i<this.finalData.length; i++)
                {
                    if(unselectedRec == this.finalData[i].product.Id)
                    {
                        console.log('value check 3',  this.finalData[i].isChecked )
                        this.finalData[i].isChecked = false;
                        console.log('value affter check remove 3',  this.finalData[i].isChecked )
                    }
                    
                }
            } catch (err) {
                console.log('error row unselected', err)
            }
            console.log('selected length 1: '+this.selectedValues.length);
        }
        else{
            try {
                this.index = this.selectedValues.indexOf( this.Values);
                this.selectedValues.splice(this.index, 1);
            } catch (err) {
                console.log('error handle chackbox', err)
            }
        }
         console.log('selected checkbox are : '+JSON.stringify(this.selectedValues));
         console.log('selected length : '+this.selectedValues.length);
         console.log('final selected length : '+JSON.stringify(this.finalData));
            this.selectedValuesCount = this.selectedValues.length;
    }

    searchHandler()
    {
        let final =[];
    
        console.log('recieved key ', this.template.querySelector('lightning-input[data-formfield="prodSearch"]').value);
        this.searchProductKey = this.template.querySelector('lightning-input[data-formfield="prodSearch"]').value;
        

        if(this.searchProductKey.length > 0)
        {
            searchProductByName({prodName : this.searchProductKey})
            .then((result)=>{
                console.log('Prod ', result);
                this.map = result.prodEntriesMap;
                //debugger;
                for(let key in this.map)
                {

                    final.push({
                        'oppId'   : this.recId,
                        'product' : this.addProperties(key)[0],
                        'entries' : this.addProperties(key)[1],
                        'qty' : 0,
                        'date':'',
                        'linedes':''
                    })
                    console.log('final search product ', final)
                }
                this.finalData = final;
            console.log('search product ', final)
            console.log('sear ent ', this.finalData)
            })
            .catch((error)=>{
                console.log('error', error)
            });
        }
        else
        {
            this.finalData = this.copyOffinalData;
        }
        
        
    }

    nextHandler()
    {
        console.log('selected ', this.selectedValues.length)
        if(this.selectedValues.length>0)
        {
            this.closeModal();
            this.recordHandler();
            this.isModal2Open = true;
            console.log('open 2nd screen', this.isModal2Open)
        }
        else{
            this.showSuccessToast('Please Select atleast 1 Product', 'error');
        }
        
    }

    recordHandler()
    {
        this.productWithPricebook = [];
        console.log('next handler', this.selectedValues.length)
        for(let k =0; k<this.selectedValues.length; k++)
        {
            for(let i=0; i<this.finalData.length ; i++)
            {
                if( this.selectedValues[k] == this.finalData[i].product.Id)
                {
                    console.log('selected value  ', this.finalData[i]);
                    this.finalData[i].isChecked = false;
                    this.productWithPricebook.push(this.finalData[i]);
                }
            }
        }
       console.log('show product ', this.productWithPricebook) ;
    }

    saveHandler()
    {
        
        var valid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            for(let key in this.productWithPricebook)
            {
                console.log('product Id ', this.productWithPricebook[key].product.Id)
                console.log('missing quantity Id ', inputField.dataset.id)
                if(this.productWithPricebook[key].product.Id == inputField.dataset.id)
                {
                    
                    console.log('value :',(inputField.value));

                    if(inputField.name == 'quantity' && inputField.value)
                    {
                        console.log('value found');
                        this.productWithPricebook[key].qty = inputField.value;
                    }
                    else if(inputField.name == 'quantity' && !inputField.value)
                    {
                        console.log('value not found');
                        valid = false;
                    }
                    
                    if(inputField.name == 'date' && inputField.value)
                    {
                        this.productWithPricebook[key].date = inputField.value;
                    }
                    
                    if(inputField.name == 'linedes' && inputField.value)
                    {
                        this.productWithPricebook[key].linedes = inputField.value;
                    }
                }
            }

        });

        console.log('Valid :',valid);
        if(valid)
        {
            this.showSpinner =true;
            console.log('Save handler');
            console.log('Prod Id ', this.productWithPricebook);
            createOpportunityline({jsonData : JSON.stringify(this.productWithPricebook)})
            .then((result)=>{
                console.log('result ', result)
                if(result)
                {
                    this.showSpinner =false;
                    this.isModal2Open = false;
                     this.showSuccessToast('Product Added Successfully', 'success');
                }
            })
            .catch((error)=>{
                console.log('error ', error)
                this.showSuccessToast('Product Cannot Be Added', 'error');
            })
        }
        else
        {
            console.log('REQ DATA MISSING');
            this.showSuccessToast('Quantity Missing', 'error');

        }
    }

    showSuccessToast(message, variantName) {
        const evt = new ShowToastEvent({
            title: 'Message',
            message: message,
            variant: variantName,
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    openPreviousModel()
    {
        this.isModal2Open= false;
        this.isModalOpen = true;
        console.log('final data after back ', JSON.stringify(this.finalData));
    }

    deleteHandler(event)
    {
        this.showSpinner =true;
        console.log('delete ', event.currentTarget.dataset.id)
        let removeProductId = event.currentTarget.dataset.id;
        for(let i=0; i<this.selectedValues.length; i++)
        {
            if(removeProductId == this.selectedValues[i])
            {
                console.log('Id Matched', this.selectedValues[i])
                this.index = this.selectedValues.indexOf( removeProductId);
                this.selectedValues.splice(this.index, 1);
            }
        }
        // for(let i=0; i<this.finalData.length(); i++)
        // {
        //     if(removeProductId == this.finalData[i].product.Id)
        //     {
        //         this.finalData[i].isChecked = false;
        //     }
            
        // }
        console.log('after deleted ', JSON.stringify(this.selectedValues));
        this.recordHandler();
        this.isModal2Open = false;
        this.isModal2Open = true;
        this.showSpinner =false;
    }

    closeModal()
    {
        this.isModalOpen = false;
    }

    showSuccessToast(message, variantName) {
        const evt = new ShowToastEvent({
            title: 'Message',
            message: message,
            variant: variantName,
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    

    


}