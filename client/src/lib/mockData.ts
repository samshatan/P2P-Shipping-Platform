export const MOCK_USER = {
  name: "Rahul Sharma",
  phone: "+91 98765 43210", 
  email: "rahul@gmail.com",
  wallet: 200,
  shipments: 24,
  moneySaved: 340,
  referrals: 5
}

export const MOCK_COURIERS = [
  { id:1, name:"Delhivery", price:89, days:"3-4", actual:"~5 days", 
    rating:4.2, cod:true, tag:"CHEAPEST", logo:"D", color:"#1a1a2e" },
  { id:2, name:"DTDC", price:110, days:"2-3", actual:"~4 days", 
    rating:4.0, cod:true, tag:"RELIABLE", logo:"D", color:"#8b0000" },
  { id:3, name:"XpressBees", price:95, days:"4-5", actual:"~6 days", 
    rating:3.8, cod:true, tag:"", logo:"X", color:"#ff6600" },
  { id:4, name:"Blue Dart", price:145, days:"1-2", actual:"~2 days", 
    rating:4.8, cod:false, tag:"FASTEST", logo:"B", color:"#003087" },
  { id:5, name:"Ecom Express", price:105, days:"3-5", actual:"~5 days", 
    rating:4.1, cod:true, tag:"BEST VALUE", logo:"E", color:"#006400" },
  { id:6, name:"Shadowfax", price:98, days:"3-4", actual:"~4 days", 
    rating:3.9, cod:true, tag:"", logo:"S", color:"#2d2d2d" }
]

export const MOCK_SHIPMENTS = [
  { awb:"SR2024031500123", from:"DEL", to:"BOM", fromCity:"New Delhi", 
    toCity:"Mumbai", courier:"Delhivery", status:"Out for Delivery", 
    amount:114, date:"Mar 15, 2024", weight:"1kg", type:"Parcel",
    evidenceVault:true, cod:false },
  { awb:"SR2024031400089", from:"BLR", to:"HYD", fromCity:"Bangalore", 
    toCity:"Hyderabad", courier:"XpressBees", status:"In Transit", 
    amount:89, date:"Mar 14, 2024", weight:"500g", type:"Document",
    evidenceVault:false, cod:false },
  { awb:"SR2024031200045", from:"DEL", to:"PNQ", fromCity:"New Delhi", 
    toCity:"Pune", courier:"Ecom Express", status:"Delivered", 
    amount:95, date:"Mar 12, 2024", weight:"2kg", type:"Parcel",
    evidenceVault:true, cod:true, codAmount:850 },
  { awb:"SR2024031000007", from:"CCU", to:"DEL", fromCity:"Kolkata", 
    toCity:"New Delhi", courier:"DTDC", status:"Exception", 
    amount:210, date:"Mar 10, 2024", weight:"3kg", type:"Parcel",
    evidenceVault:false, cod:false },
  { awb:"SR2024030800212", from:"BOM", to:"MAA", fromCity:"Mumbai", 
    toCity:"Chennai", courier:"Blue Dart", status:"Delivered", 
    amount:320, date:"Mar 8, 2024", weight:"1.5kg", type:"Fragile",
    evidenceVault:true, cod:false },
  { awb:"RET-SR992", from:"PNQ", to:"DEL", fromCity:"Pune", 
    toCity:"New Delhi", courier:"Delhivery", status:"Return Pending", 
    amount:0, date:"Mar 5, 2024", weight:"1kg", type:"Parcel",
    evidenceVault:false, cod:false }
]
