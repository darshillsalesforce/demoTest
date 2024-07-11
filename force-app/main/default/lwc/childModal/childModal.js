import { LightningElement, track ,api, wire} from 'lwc';
import createOpportunityline from '@salesforce/apex/ProductController.createOpportunityline';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ChildModal extends LightningElement {
  @track isModal2Open =true;
  @api prodPriceBook;
  @track prodData = [];
  prodArray = [];
  entryArray = [];
  values;
  selectedValues;
    
    connectedCallback() {
        console.log('Prod with priceBook ', this.prodPriceBook)
        console.log('Prod with priceBook leng ', this.prodPriceBook.length)
        for(let i=0; i<this.prodPriceBook.length; i++)
        {
            let newItem = {
                ...this.prodPriceBook[i], // Spread the original properties
                qty: 0,                   // Add the qty property with a default value
                date:'',
                linedes:''         // Add the date property with the current date
            };

            // Push the new object to the prodData array
            this.prodData.push(newItem);
        }
        console.log('prod data :',this.prodData);
        //this.prodData = this.prodPriceBook;
    }
    
    deleteHandler()
    {
        console.log('delete')
    }
    openPreviousModel()
    {
        this.isModal2Open = false;
        const myEvent = new CustomEvent('openmodel' , { detail : true});
        this.dispatchEvent(myEvent);
    }

    
    saveHandler()
    {
        var valid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            for(let key in this.prodData)
            {
                if(this.prodData[key].product.Id == inputField.dataset.id)
                {
                    
                    console.log('value :',(inputField.value));

                    if(inputField.name == 'quantity' && inputField.value)
                    {
                        console.log('value found');
                        this.prodData[key].qty = inputField.value;
                    }
                    else if(inputField.name == 'quantity' && !inputField.value)
                    {
                        console.log('value not found');
                        valid = false;
                    }
                    
                    if(inputField.name == 'date' && inputField.value)
                    {
                        this.prodData[key].date = inputField.value;
                    }
                    
                    if(inputField.name == 'linedes' && inputField.value)
                    {
                        this.prodData[key].linedes = inputField.value;
                    }
                }
            }

        });


        console.log('Valid :',valid);
        if(valid)
        {
            console.log('Save handler');
            console.log('Prod Id ', this.prodData);
            createOpportunityline({jsonData : JSON.stringify(this.prodData)})
            .then((result)=>{
                console.log('result ', result)
                if(result)
                {
                    this.isModalOpen = false;
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
  
}