export type Language = "en" | "mm";

export const translations = {
  // App
  appName: { en: "Ah-Maw-Pyay", mm: "အမောပြေ" },
  appTagline: { en: "Pure Water Delivery", mm: "သန့်ရှင်းသောရေ ပို့ဆောင်ရေး" },
  
  // Navigation
  home: { en: "Home", mm: "ပင်မစာမျက်နှာ" },
  dashboard: { en: "Dashboard", mm: "ဒက်ရှ်ဘုတ်" },
  orders: { en: "Orders", mm: "အော်ဒါများ" },
  inventory: { en: "Inventory", mm: "ကုန်ပစ္စည်းစာရင်း" },
  invoices: { en: "Invoices", mm: "ပြေစာများ" },
  customers: { en: "Customers", mm: "ဖောက်သည်များ" },
  staff: { en: "Staff", mm: "ဝန်ထမ်းများ" },
  analytics: { en: "Analytics", mm: "ခွဲခြမ်းစိတ်ဖြာမှု" },
  reports: { en: "Reports", mm: "အစီရင်ခံစာများ" },
  settings: { en: "Settings", mm: "ဆက်တင်များ" },
  deliveries: { en: "Deliveries", mm: "ပို့ဆောင်မှုများ" },
  truckStock: { en: "Truck Stock", mm: "ကားပေါ်ကုန်ပစ္စည်း" },
  zones: { en: "Delivery Zones", mm: "ပို့ဆောင်ရေးဇုန်များ" },
  loyalty: { en: "Loyalty Points", mm: "Loyalty Points" },

  // Auth
  login: { en: "Login", mm: "ဝင်ရောက်ပါ" },
  logout: { en: "Logout", mm: "ထွက်ပါ" },
  username: { en: "Username", mm: "အသုံးပြုသူအမည်" },
  password: { en: "Password", mm: "စကားဝှက်" },
  staffLogin: { en: "Staff Login", mm: "ဝန်ထမ်းအဖြစ် ဝင်ရောက်ပါ" },
  adminLogin: { en: "Admin Login", mm: "Admin ဝင်ရောက်ပါ" },
  publicOrder: { en: "Place Order", mm: "အများသူငါ မှာယူမှု" },
  
  // Products
  products: { en: "Products", mm: "ထုတ်ကုန်များ" },
  productName: { en: "Product Name", mm: "ထုတ်ကုန်အမည်" },
  unitPrice: { en: "Unit Price", mm: "တစ်ခုချင်းစျေးနှုန်း" },
  bottleType: { en: "Bottle Type", mm: "ဗူးအမျိုးအစား" },
  gallon20L: { en: "20L Gallon", mm: "၂၀ လီတာ ဂါလံ" },
  smallBottle: { en: "Small Bottle", mm: "ဗူးငယ်" },
  
  // Orders
  orderNumber: { en: "Order Number", mm: "အော်ဒါနံပါတ်" },
  orderStatus: { en: "Order Status", mm: "အော်ဒါအခြေအနေ" },
  pending: { en: "Pending", mm: "ဆိုင်းငံ့ဆဲ" },
  processing: { en: "Processing", mm: "ဆောင်ရွက်နေဆဲ" },
  delivered: { en: "Delivered", mm: "ပို့ဆောင်ပြီး" },
  cancelled: { en: "Cancelled", mm: "ပယ်ဖျက်ပြီး" },
  placeOrder: { en: "Place Order", mm: "အော်ဒါတင်ပါ" },
  orderProduct: { en: "Order Now", mm: "ပစ္စည်းမှာရန်" },
  trackOrder: { en: "Track Order", mm: "အော်ဒါခြေရာခံပါ" },
  newOrder: { en: "New Order", mm: "အော်ဒါအသစ်" },
  
  // Customer
  customerName: { en: "Customer Name", mm: "ဖောက်သည်အမည်" },
  phone: { en: "Phone", mm: "ဖုန်းနံပါတ်" },
  address: { en: "Address", mm: "လိပ်စာ" },
  
  // Inventory
  currentStock: { en: "Current Stock", mm: "လက်ရှိကုန်ပစ္စည်း" },
  stockIn: { en: "Stock In", mm: "ကုန်ပစ္စည်းဝင်" },
  stockOut: { en: "Stock Out", mm: "ကုန်ပစ္စည်းထွက်" },
  lowStock: { en: "Low Stock", mm: "ကုန်ပစ္စည်းနည်း" },
  restockAlert: { en: "Restock Alert", mm: "ပြန်လည်ဖြည့်တင်းရန်" },
  minStockLevel: { en: "Min Stock Level", mm: "အနည်းဆုံးပမာဏ" },
  
  // Invoice
  invoiceNumber: { en: "Invoice Number", mm: "ပြေစာနံပါတ်" },
  subtotal: { en: "Subtotal", mm: "စုစုပေါင်းခွဲ" },
  deliveryFee: { en: "Delivery Fee", mm: "ပို့ဆောင်ခ" },
  discount: { en: "Discount", mm: "လျှော့စျေး" },
  tax: { en: "Tax", mm: "အခွန်" },
  total: { en: "Total", mm: "စုစုပေါင်း" },
  generateInvoice: { en: "Generate Invoice", mm: "ပြေစာထုတ်ပါ" },
  exportPDF: { en: "Export PDF", mm: "PDF ထုတ်ပါ" },
  
  // Staff
  assignedDeliveries: { en: "Assigned Deliveries", mm: "တာဝန်ပေးထားသော ပို့ဆောင်မှုများ" },
  updateStatus: { en: "Update Status", mm: "အခြေအနေ ပြင်ဆင်ပါ" },
  
  // Dashboard
  totalSales: { en: "Total Sales", mm: "စုစုပေါင်းအရောင်း" },
  todaySales: { en: "Today's Sales", mm: "ယနေ့အရောင်း" },
  pendingOrders: { en: "Pending Orders", mm: "ဆိုင်းငံ့ဆဲ အော်ဒါများ" },
  totalRevenue: { en: "Total Revenue", mm: "စုစုပေါင်းဝင်ငွေ" },
  revenueChart: { en: "Revenue Trends", mm: "ဝင်ငွေလမ်းကြောင်း" },
  topCustomers: { en: "Top Customers", mm: "ထိပ်တန်းဖောက်သည်များ" },
  
  // Reports
  dailyReport: { en: "Daily Report", mm: "နေ့စဉ်အစီရင်ခံစာ" },
  weeklyReport: { en: "Weekly Report", mm: "အပတ်စဉ်အစီရင်ခံစာ" },
  monthlyReport: { en: "Monthly Report", mm: "လစဉ်အစီရင်ခံစာ" },
  exportCSV: { en: "Export CSV", mm: "CSV ထုတ်ပါ" },
  dateRange: { en: "Date Range", mm: "ရက်စွဲအပိုင်းအခြား" },
  
  // Common
  save: { en: "Save", mm: "သိမ်းပါ" },
  cancel: { en: "Cancel", mm: "ပယ်ဖျက်ပါ" },
  edit: { en: "Edit", mm: "ပြင်ဆင်ပါ" },
  delete: { en: "Delete", mm: "ဖျက်ပါ" },
  search: { en: "Search", mm: "ရှာဖွေပါ" },
  filter: { en: "Filter", mm: "စစ်ထုတ်ပါ" },
  create: { en: "Create", mm: "ဖန်တီးပါ" },
  view: { en: "View", mm: "ကြည့်ပါ" },
  actions: { en: "Actions", mm: "လုပ်ဆောင်ချက်များ" },
  quantity: { en: "Quantity", mm: "အရေအတွက်" },
  amount: { en: "Amount", mm: "ပမာဏ" },
  date: { en: "Date", mm: "ရက်စွဲ" },
  status: { en: "Status", mm: "အခြေအနေ" },
  note: { en: "Note", mm: "မှတ်ချက်" },
  noData: { en: "No data available", mm: "ဒေတာမရှိပါ" },
  loading: { en: "Loading...", mm: "ဖွင့်နေသည်..." },
  success: { en: "Success", mm: "အောင်မြင်ပါသည်" },
  error: { en: "Error", mm: "အမှားတစ်ခုဖြစ်ပွားသည်" },
  confirm: { en: "Confirm", mm: "အတည်ပြုပါ" },
  back: { en: "Back", mm: "နောက်သို့" },
  next: { en: "Next", mm: "ရှေ့သို့" },
  from: { en: "From", mm: "မှ" },
  to: { en: "To", mm: "သို့" },
  all: { en: "All", mm: "အားလုံး" },
  today: { en: "Today", mm: "ယနေ့" },
  thisWeek: { en: "This Week", mm: "ဤအပတ်" },
  thisMonth: { en: "This Month", mm: "ဤလ" },
  
  // Delivery performance
  deliveryPerformance: { en: "Delivery Performance", mm: "ပို့ဆောင်မှုစွမ်းဆောင်ရည်" },
  bottleBreakdown: { en: "Bottle Type Breakdown", mm: "ဗူးအမျိုးအစားခွဲခြမ်း" },
  
  // Additional
  totalOrders: { en: "Total Orders", mm: "စုစုပေါင်းအော်ဒါ" },

  // Language
  language: { en: "Language", mm: "ဘာသာစကား" },
  english: { en: "English", mm: "အင်္ဂလိပ်" },
  myanmar: { en: "Myanmar", mm: "မြန်မာ" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.en || key;
}
