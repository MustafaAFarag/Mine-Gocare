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
};
