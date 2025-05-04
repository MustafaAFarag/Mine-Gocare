export const ApiEndPoint = {
  allCategoriesApi: 'api/services/ClientApp/ProductCategory/SearchAll',
  getAllProductVariantsForClient:
    'api/services/ClientApp/Product/GetAllProductVariantsForClient',
  getProductDetails: 'api/services/ClientApp/Product/GetProductDetails',
  SignInManually: 'api/services/AdminApp/SignIn/SignInManually',
  SignUpManually: 'api/services/ClientApp/SignUp/SignUpManually',
  GetClientAddresses: 'api/services/ClientApp/Address/GetClientAddresses',
  CreateAddress: 'api/services/ClientApp/Address/CreateAddress',
  DeleteAddress: 'api/services/ClientApp/Address/DeleteAddress',
  UpdateAddress: 'api/services/ClientApp/Address/UpdateAddress',
  GetWallet: 'api/services/AdminApp/ClientWalletService/GetClientWalletData',
  GetWalletTransactionList:
    'api/services/ClientApp/ClientWalletService/GetWalletTransactionList',
  updateClientName: 'api/services/ClientApp/Client/UpdateName',
  getClientProfile: 'api/services/ClientApp/Client/GetProfile',
  updateClientPhone: 'api/services/ClientApp/Client/UpdateMobileNumber',
  updateClientEmail: 'api/services/ClientApp/Client/UpdateEmailAddress',
  updateClientPassword: 'api/services/ClientApp/Client/ChangePassword',
  updateClientGender: 'api/services/ClientApp/Client/UpdateGender',
  getAllCities: 'api/services/ClientApp/City/GetAllCities',
  getAllDistricts: 'api/services/ClientApp/City/GetAllDistricts',
  getAllCountries: 'api/services/ClientApp/Country/GetCountries?IsActive=true',
  getAllPromoCodes: 'api/services/ClientApp/PromoCode/GetAllPromoCodes',
  ValidatePromoCode:
    'api/services/ClientApp/PromoCode/ValidateProductPromoCode',
  GetClientPointsPreview:
    'api/services/ClientApp/ClientPointing/GetClientPointsPreview',
  AddPoints: 'api/services/ClientApp/ClientPointing/AddPoints',
  GetAllPointingSettings:
    'api/services/ClientApp/ClientPointing/GetALlPointingSettings',
  GetClientTotalPoints:
    'api/services/ClientApp/ClientPointing/GetClientTotalPoints',
  RedeemingPoints: 'api/services/ClientApp/ClientPointing/RedeemingPoints',
  SetExpiredPoints: 'api/services/ClientApp/ClientPointing/SetExpiredPoints',
  ConvertPointsToWalletCredit:
    'api/services/ClientApp/ClientPointing/ConvertPointsToWalletCredit?NumberOfPoints=1000',
};
