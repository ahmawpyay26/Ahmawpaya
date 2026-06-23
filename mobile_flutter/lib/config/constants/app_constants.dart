// API Configuration
const String API_BASE_URL = 'http://localhost:3000/api';
const String API_TIMEOUT_SECONDS = '30';

// App Configuration
const String APP_NAME = 'အမောပြေ';
const String APP_VERSION = '1.0.0';

// Database Configuration
const String DATABASE_NAME = 'amaw_pyay_db';

// Shared Preferences Keys
const String PREF_AUTH_TOKEN = 'auth_token';
const String PREF_USER_ID = 'user_id';
const String PREF_USER_ROLE = 'user_role';
const String PREF_LAST_SYNC = 'last_sync';
const String PREF_LANGUAGE = 'language';

// Pagination
const int PAGE_SIZE = 20;

// Product Units
const List<String> PRODUCT_UNITS = ['20L', '1L', '0.5L', '0.35L'];

// Order Status
const List<String> ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];

// Invoice Status
const List<String> INVOICE_STATUSES = ['draft', 'issued', 'paid', 'overdue', 'cancelled'];

// Vehicle Status
const List<String> VEHICLE_STATUSES = ['active', 'maintenance', 'inactive'];

// Delivery Route Status
const List<String> DELIVERY_ROUTE_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

// Sync Queue Actions
const List<String> SYNC_ACTIONS = ['create', 'update', 'delete'];

// Sync Queue Entity Types
const List<String> SYNC_ENTITY_TYPES = ['order', 'invoice', 'product', 'customer', 'vehicle'];

// Error Messages
const String ERROR_NETWORK = 'Network error occurred';
const String ERROR_SERVER = 'Server error occurred';
const String ERROR_UNAUTHORIZED = 'Unauthorized access';
const String ERROR_NOT_FOUND = 'Resource not found';
const String ERROR_VALIDATION = 'Validation error';

// Success Messages
const String SUCCESS_LOGIN = 'Login successful';
const String SUCCESS_LOGOUT = 'Logout successful';
const String SUCCESS_CREATE = 'Created successfully';
const String SUCCESS_UPDATE = 'Updated successfully';
const String SUCCESS_DELETE = 'Deleted successfully';
