abstract class AppConstants {
  // App identity
  static const appName = 'Apna Fashion Mart';
  static const appTagline = 'Your neighbourhood, in vogue.';
  static const companyName = 'Apna Fashion Mart Pvt. Ltd.';
  static const supportEmail = 'support@apnafashionmart.in';
  static const supportPhone = '+91 98765 43210';
  static const websiteUrl = 'https://apnafashionmart.com';
  static const privacyPolicyUrl = 'https://apnafashionmart.com/legal/privacy';
  static const termsUrl = 'https://apnafashionmart.com/legal/terms';
  static const refundPolicyUrl = 'https://apnafashionmart.com/legal/refund';
  static const becomeASellerUrl = 'https://apnafashionmart.com/become-a-seller';
  static const vendorAgreementUrl = 'https://apnafashionmart.com/legal/vendor';
  static const nearbyShopsApiUrl = 'https://apnafashionmart.com/api/nearby-shops';

  // API resource / table names (used as path segments in REST calls)
  static const tableProducts = 'products';
  static const tableOrders = 'orders';
  static const tableProfiles = 'profiles';
  static const tableShops = 'shops';
  static const tableReviews = 'reviews';
  static const tableWishlist = 'wishlist';
  static const tableAddresses = 'addresses';
  static const tableCartItems = 'cart_items';
  static const tableReturns = 'returns';
  static const tableNotifications = 'notifications';
  static const tableOrderItems = 'order_items';
  static const tableCategories = 'categories';

  // Pagination
  static const defaultPageSize = 20;
  static const maxPageSize = 50;

  // Cart constraints
  static const maxCartItems = 20;
  static const maxCartItemQuantity = 10;

  // Discovery
  static const nearbyRadiusKm = 10.0;
  static const defaultCity = 'Delhi';

  // Local storage keys
  static const recentlyViewedKey = 'afm_recently_viewed';
  static const cartKey = 'afm_cart';
  static const wishlistKey = 'afm_wishlist';
  static const onboardingCompleteKey = 'afm_onboarding_done';
  static const selectedCityKey = 'afm_selected_city';
  static const themeModeKey = 'afm_theme_mode';
  static const languageKey = 'afm_language';

  // Business rules
  static const maxRecentlyViewed = 12;
  static const freeDeliveryThreshold = 999; // in INR
  static const defaultDeliveryFee = 49; // in INR
  static const maxReturnDays = 7;
  static const otpLength = 6;
  static const otpResendSeconds = 30;

  // Razorpay
  static const razorpayCurrency = 'INR';
  static const razorpayCompanyName = 'Apna Fashion Mart';

  // Supported Indian cities
  static const supportedCities = [
    'Delhi',
    'Mumbai',
    'Bengaluru',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
    'Surat',
    'Kanpur',
    'Nagpur',
    'Indore',
    'Bhopal',
    'Patna',
    'Vadodara',
    'Ludhiana',
    'Agra',
    'Nashik',
  ];

  // Fashion categories
  static const categories = [
    'Kurtas & Suits',
    'Sarees',
    'Lehengas',
    'Anarkalis',
    'Dupattas',
    'Bottoms',
    'Tops & Tunics',
    'Ethnic Sets',
    'Men\'s Kurtas',
    'Sherwanis',
    'Indo-Western',
    'Accessories',
    'Footwear',
    'Jewellery',
    'Kids\' Wear',
  ];
}
