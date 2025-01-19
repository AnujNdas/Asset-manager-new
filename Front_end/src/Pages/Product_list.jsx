import React from 'react'
import { useState } from 'react'
import '../Page_styles/Product_list.css'
const ProductList = () => {
    const defaultFormData = {
        assetCode:'',
        assetCategory:'',
        barcodeNumber:'',
        assetName:'',
        associateUnit:'',
        locationName:'',
    }
    const [formData, setFormData] = useState(defaultFormData)

    // Handle input change
    const handlechange = (e) => {
        const { name, value} = e.target;
        setFormData((prevData)=>({
            ...prevData, [name] : value
        }))
    }
    // Handle form submission
    const handlesubmit = async (e) => {
        e.preventDefault();
        
        // Validation check (optional)
        if (!formData.assetCode || !formData.assetName || !formData.locationName) {
            alert("Please fill in all required fields.");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:5000/api/assets/", {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                },
                body : JSON.stringify(formData),
            });
    
            if (response.ok) {
                console.log(response)
                const data = await response.json();
                alert("Asset added successfully!");
                console.log(data);
                setFormData(defaultFormData);
            } else {
                const error = await response.json();
                console.error("Error adding asset:", error);
                alert(`Error: ${error.message || "Failed to add asset"}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while adding the asset.");
        }
    };
      return (
    <div className='container'>
        <section className="nav">
            <form className="form_container" onSubmit={handlesubmit}>
                <div className="from_area">
                    <input
                     type="text" required 
                     className="input_box"
                     name='assetCode'
                     value={formData.assetCode}
                     onChange={handlechange}
                     />
                    <div className="label_name">Asset Code</div>
                </div>
                <div className="from_area">
                    <input
                     type="text" required 
                     name='assetCategory'
                     className="input_box"
                     value={formData.assetCategory}
                     onChange={handlechange}
                     />
                    <div className="label_name">Asset Category</div>
                </div>
                <div className="from_area">
                    <input
                     type="text" required
                     name='barcodeNumber'
                     className="input_box"
                     value={formData.barcodeNumber}
                     onChange={handlechange}
                     />
                    <div className="label_name">Barcode Number</div>
                </div>
                <div className="from_area">
                    <input
                     type="text" required 
                     name='assetName'
                     className="input_box"
                     value={formData.assetName}
                     onChange={handlechange}
                     />
                    <div className="label_name">Asset Name</div>
                </div>
                <div className="from_area">
                    <input
                     type="text" required 
                     name='associateUnit'
                     className="input_box"
                     value={formData.associateUnit}
                     onChange={handlechange}
                     />
                    <div className="label_name">Associate Unit</div>
                </div>
                <div className="from_area">
                    <input
                     type="text" required 
                     name='locationName'
                     className="input_box"
                     value={formData.locationName}
                     onChange={handlechange}
                     />
                    <div className="label_name">Location Name</div>
                </div>
                {/* <div className="from_area">
                    <input type="text" required className="input_box"/>
                    <div className="label_name">Asset Specifications</div>
                </div>
                <div className="from_area">
                    <input type="text" required className="input_box"/>
                    <div className="label_name">Asset Status</div>
                </div>
                <div className="from_area">
                    <input type="text" required className="input_box"/>
                    <div className="label_name">Date of Purchase</div>
                </div>
                <div className="from_area">
                    <input type="text" required className="input_box"/>
                    <div className="label_name">Date of Expiry</div>
                </div>
                <div className="from_area">
                    <input type="text" required className="input_box"/>
                    <div className="label_name">Asset Life Time</div>
                </div>
                <div className="from_area">
                    <input type="text" required className="input_box"/>
                    <div className="label_name">Preventive Maintenance Date</div>
                </div>
                <div className="from_area">
                    <input type="text" required className="input_box"/>
                    <div className="label_name">PreventiveMaintenanceDueDate</div>
                </div>
                <div className="from_area">
                    <input type="text" required className="input_box"/>
                    <div className="label_name">Purchased From</div>
                </div> */}
                <button type='submit' className='button'>Submit</button>
            </form>
        </section>
        <section className="content"></section>
    </div>
  )
}

export default ProductList
