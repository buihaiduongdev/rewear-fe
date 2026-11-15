# Graph Report - rewear-fe  (2026-11-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3157 nodes · 4417 edges · 100 communities (90 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06634ec9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 92
- Community 93

## God Nodes (most connected - your core abstractions)
1. `orvalRequest()` - 168 edges
2. `next` - 32 edges
3. `react` - 30 edges
4. `getApiErrorMessage()` - 23 edges
5. `@tanstack/react-query` - 21 edges
6. `zod` - 18 edges
7. `compilerOptions` - 16 edges
8. `scripts` - 15 edges
9. `formatPrice()` - 14 edges
10. `next-auth` - 14 edges

## Surprising Connections (you probably didn't know these)
- `userAddressControllerCreate()` --calls--> `orvalRequest()`  [EXTRACTED]
  src/shared/api/generated/user-addresses/user-addresses.ts → src/shared/api/orval-request.ts
- `userAddressControllerFindAll()` --calls--> `orvalRequest()`  [EXTRACTED]
  src/shared/api/generated/user-addresses/user-addresses.ts → src/shared/api/orval-request.ts
- `userAddressControllerFindOne()` --calls--> `orvalRequest()`  [EXTRACTED]
  src/shared/api/generated/user-addresses/user-addresses.ts → src/shared/api/orval-request.ts
- `userAddressControllerRemove()` --calls--> `orvalRequest()`  [EXTRACTED]
  src/shared/api/generated/user-addresses/user-addresses.ts → src/shared/api/orval-request.ts
- `userAddressControllerUpdate()` --calls--> `orvalRequest()`  [EXTRACTED]
  src/shared/api/generated/user-addresses/user-addresses.ts → src/shared/api/orval-request.ts

## Import Cycles
- None detected.

## Communities (100 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.00
Nodes (741): ProductControllerCreateBody, productControllerCreateBodyBrandMax, productControllerCreateBodyCategoryIdRegExp, productControllerCreateBodyColorMax, productControllerCreateBodyDefectsItemDescriptionMax, productControllerCreateBodyDefectsItemMediaIdsItemRegExp, productControllerCreateBodyDefectsItemMediaIdsMax, productControllerCreateBodyDefectsMax (+733 more)

### Community 1 - "Community 1"
Cohesion: 0.00
Nodes (471): AdministrativeDivisionControllerFindAllProvinces200DataItem, AdministrativeDivisionControllerFindAllProvinces200StatusCode, AdministrativeDivisionControllerFindWardsByProvinceCode200DataItem, AdministrativeDivisionControllerFindWardsByProvinceCode200StatusCode, AuthControllerForgotPassword200Data, AuthControllerForgotPassword200StatusCode, AuthControllerLogin200Data, AuthControllerLogin200DataUser (+463 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (176): CheckoutControllerCancelParams, checkoutControllerCancelPathIdRegExp, CheckoutControllerCancelResponse, checkoutControllerCancelResponseDataExpiresAtRegExp, checkoutControllerCancelResponseDataHoldSecondsMax, checkoutControllerCancelResponseDataHoldSecondsMin, checkoutControllerCancelResponseDataIdRegExp, checkoutControllerCancelResponseDataOrdersItemIdRegExp (+168 more)

### Community 3 - "Community 3"
Cohesion: 0.02
Nodes (81): MediaControllerConfirmUploadBody, mediaControllerConfirmUploadBodyMimeTypeMax, mediaControllerConfirmUploadBodySizeBytesMax, mediaControllerConfirmUploadBodyStorageKeyMax, MediaControllerConfirmUploadParams, mediaControllerConfirmUploadPathProductIdRegExp, MediaControllerConfirmUploadResponse, mediaControllerConfirmUploadResponseDataCreatedAtRegExp (+73 more)

### Community 4 - "Community 4"
Cohesion: 0.03
Nodes (73): ShopControllerAddStaffBody, shopControllerAddStaffBodyUserIdRegExp, ShopControllerAddStaffParams, shopControllerAddStaffPathIdRegExp, ShopControllerAddStaffResponse, shopControllerAddStaffResponseDataCreatedAtRegExp, shopControllerAddStaffResponseDataIdRegExp, shopControllerAddStaffResponseDataJoinedAtRegExp (+65 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (70): ShippingControllerPackageOptionsResponse, shippingControllerPackageOptionsResponseDataCustomLimitsMaxDimensionCmMax, shippingControllerPackageOptionsResponseDataCustomLimitsMaxDimensionCmMin, shippingControllerPackageOptionsResponseDataCustomLimitsMaxWeightGramsMax, shippingControllerPackageOptionsResponseDataCustomLimitsMaxWeightGramsMin, shippingControllerPackageOptionsResponseDataSizePresetsItemHeightCmMax, shippingControllerPackageOptionsResponseDataSizePresetsItemHeightCmMin, shippingControllerPackageOptionsResponseDataSizePresetsItemLengthCmMax (+62 more)

### Community 6 - "Community 6"
Cohesion: 0.03
Nodes (61): UserControllerCreateBody, userControllerCreateBodyEmailMax, userControllerCreateBodyEmailRegExp, userControllerCreateBodyFullNameMax, userControllerCreateBodyPasswordMax, userControllerCreateBodyPasswordMin, UserControllerCreateResponse, userControllerCreateResponseDataCreatedAtRegExp (+53 more)

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (59): getProductControllerCreateMutationKey(), getProductControllerCreateMutationOptions(), getProductControllerFindAllQueryKey(), getProductControllerFindAllQueryOptions(), getProductControllerModerateMutationKey(), getProductControllerModerateMutationOptions(), getProductControllerUpdateMutationKey(), getProductControllerUpdateMutationOptions() (+51 more)

### Community 8 - "Community 8"
Cohesion: 0.04
Nodes (56): authControllerForgotPassword(), AuthControllerForgotPasswordMutationBody, AuthControllerForgotPasswordMutationError, AuthControllerForgotPasswordMutationResult, AuthControllerForgotPasswordMutationVariables, AuthControllerLoginMutationBody, AuthControllerLoginMutationError, AuthControllerLoginMutationResult (+48 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (54): categoryControllerCreate(), CategoryControllerCreateResult, categoryControllerFindAll(), CategoryControllerFindAllResult, categoryControllerFindOne(), CategoryControllerFindOneResult, categoryControllerRemove(), CategoryControllerRemoveResult (+46 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (52): SecondParameter, userAddressControllerCreate(), UserAddressControllerCreateResult, userAddressControllerFindAll(), UserAddressControllerFindAllResult, userAddressControllerFindOne(), UserAddressControllerFindOneResult, userAddressControllerRemove() (+44 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (51): productControllerCreate(), ProductControllerCreateResult, productControllerFindAll(), ProductControllerFindAllResult, productControllerFindManaged(), ProductControllerFindManagedResult, productControllerFindMine(), ProductControllerFindMineResult (+43 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (42): checkoutControllerCancel(), CheckoutControllerCancelResult, checkoutControllerCreate(), CheckoutControllerCreateResult, checkoutControllerFind(), CheckoutControllerFindResult, checkoutControllerQuote(), CheckoutControllerQuoteResult (+34 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (43): UserAddressControllerCreateBody, userAddressControllerCreateBodyAddressLine1Max, userAddressControllerCreateBodyAddressLine2Max, userAddressControllerCreateBodyDeliveryInstructionsMax, userAddressControllerCreateBodyLabelMax, userAddressControllerCreateBodyPhoneRegExp, userAddressControllerCreateBodyPostalCodeMax, userAddressControllerCreateBodyProvinceCodeRegExp (+35 more)

### Community 14 - "Community 14"
Cohesion: 0.05
Nodes (39): CategoryControllerCreateBody, categoryControllerCreateBodyNameMax, categoryControllerCreateBodyNameRegExp, categoryControllerCreateBodyRequiredMeasurementsMax, categoryControllerCreateBodySlugMax, categoryControllerCreateBodySlugRegExp, CategoryControllerCreateResponse, categoryControllerCreateResponseDataCreatedAtRegExp (+31 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (33): CartControllerAddBody, cartControllerAddBodyDefault, CartControllerAddParams, cartControllerAddPathProductIdRegExp, CartControllerAddResponse, cartControllerAddResponseDataGroupsItemItemsItemAddedAtRegExp, cartControllerAddResponseDataGroupsItemItemsItemProductIdRegExp, cartControllerAddResponseDataGroupsItemItemsItemProductIdRegExpOne (+25 more)

### Community 16 - "Community 16"
Cohesion: 0.06
Nodes (32): authControllerForgotPassword(), AuthControllerForgotPasswordResult, AuthControllerLoginResult, AuthControllerLogoutResult, AuthControllerOauthResult, AuthControllerRefreshResult, authControllerRegister(), AuthControllerRegisterResult (+24 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (28): Props, SecondParameter, shippingControllerPackageOptions(), ShippingControllerPackageOptionsResult, shippingControllerUpdatePackage(), ShippingControllerUpdatePackageResult, ProductControllerFindManaged200Data, ShippingControllerPackageOptions200 (+20 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (31): getMediaControllerReorderMutationKey(), getMediaControllerReorderMutationOptions(), MediaControllerConfirmUploadMutationBody, MediaControllerConfirmUploadMutationError, MediaControllerConfirmUploadMutationResult, MediaControllerConfirmUploadMutationVariables, MediaControllerCreateUploadTicketMutationBody, MediaControllerCreateUploadTicketMutationError (+23 more)

### Community 19 - "Community 19"
Cohesion: 0.06
Nodes (31): AuthControllerForgotPasswordBody, authControllerForgotPasswordBodyEmailMax, authControllerForgotPasswordBodyEmailRegExp, authControllerLoginBodyEmailMax, authControllerLoginBodyEmailRegExp, authControllerLoginBodyPasswordMax, authControllerLoginBodyPasswordMin, authControllerLoginResponseDataUserEmailRegExp (+23 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (31): PickupLocationControllerFindPersonalResponse, pickupLocationControllerFindPersonalResponseDataLocationCreatedAtRegExp, pickupLocationControllerFindPersonalResponseDataLocationIdRegExp, pickupLocationControllerFindPersonalResponseDataLocationUpdatedAtRegExp, PickupLocationControllerFindShopParams, pickupLocationControllerFindShopPathShopIdRegExp, PickupLocationControllerFindShopResponse, pickupLocationControllerFindShopResponseDataLocationCreatedAtRegExp (+23 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (21): @tanstack/react-query, AddDeliveryAddress(), AddressForm(), CheckoutPage(), Checkout, reasons, ShippingEstimateForOrder(), ShippingEstimateSummary() (+13 more)

### Community 22 - "Community 22"
Cohesion: 0.07
Nodes (29): SecondParameter, shopControllerAddStaff(), ShopControllerAddStaffResult, shopControllerCreate(), ShopControllerCreateResult, shopControllerFindAll(), ShopControllerFindAllResult, shopControllerFindMembers() (+21 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (29): getShopControllerUpdateMutationKey(), getShopControllerUpdateMutationOptions(), SecondParameter, ShopControllerAddStaffMutationBody, ShopControllerAddStaffMutationError, ShopControllerAddStaffMutationResult, ShopControllerAddStaffMutationVariables, ShopControllerCreateMutationBody (+21 more)

### Community 24 - "Community 24"
Cohesion: 0.07
Nodes (28): mediaControllerConfirmUpload(), MediaControllerConfirmUploadResult, mediaControllerCreateUploadTicket(), MediaControllerCreateUploadTicketResult, mediaControllerDelete(), MediaControllerDeleteResult, mediaControllerFindAll(), MediaControllerFindAllResult (+20 more)

### Community 25 - "Community 25"
Cohesion: 0.10
Nodes (27): getPickupLocationControllerFindPersonalQueryKey(), getPickupLocationControllerFindPersonalQueryOptions(), getPickupLocationControllerFindShopQueryKey(), getPickupLocationControllerFindShopQueryOptions(), getPickupLocationControllerSavePersonalMutationKey(), getPickupLocationControllerSavePersonalMutationOptions(), getPickupLocationControllerSaveShopMutationKey(), getPickupLocationControllerSaveShopMutationOptions() (+19 more)

### Community 26 - "Community 26"
Cohesion: 0.07
Nodes (25): name, packageManager, private, version, class-variance-authority, cypress, husky, jsdom (+17 more)

### Community 27 - "Community 27"
Cohesion: 0.16
Nodes (17): @base-ui/react, lucide-react, HomePage(), ProductCard(), ProductPreview(), ShopCard(), useHomeCatalog(), updateFilters() (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.08
Nodes (26): getUserControllerRemoveMutationKey(), getUserControllerRemoveMutationOptions(), SecondParameter, UserControllerCreateMutationBody, UserControllerCreateMutationError, UserControllerCreateMutationResult, UserControllerCreateMutationVariables, UserControllerFindAllQueryError (+18 more)

### Community 29 - "Community 29"
Cohesion: 0.08
Nodes (25): SecondParameter, userControllerCreate(), UserControllerCreateResult, userControllerFindAll(), UserControllerFindAllResult, userControllerFindOne(), UserControllerFindOneResult, userControllerGetMe() (+17 more)

### Community 30 - "Community 30"
Cohesion: 0.08
Nodes (25): dependencies, @auth/core, axios, @base-ui/react, class-variance-authority, cn, @hookform/resolvers, @hugeicons/core-free-icons (+17 more)

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (22): cartControllerAdd(), CartControllerAddMutationBody, CartControllerAddMutationError, CartControllerAddMutationResult, CartControllerAddMutationVariables, cartControllerFindMine(), CartControllerFindMineQueryError, CartControllerFindMineQueryResult (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (14): ms, SectionState(), createQueryClient(), shouldRetry(), EmptyPanel(), ErrorNotice(), ToastItem(), ToastViewport() (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (14): metadata, TResetPasswordPageProps, ResetPasswordForm(), TResetPasswordFormProps, PasswordStrengthMeter(), STRENGTH_LEVELS, TPasswordStrengthMeterProps, useResetPassword() (+6 more)

### Community 35 - "Community 35"
Cohesion: 0.10
Nodes (21): devDependencies, cypress, eslint, eslint-config-next, husky, jsdom, lint-staged, orval (+13 more)

### Community 36 - "Community 36"
Cohesion: 0.14
Nodes (15): @auth/core, jose, handlers, signIn, signOut, buildAuthToken(), getExpMs(), getRefreshToken() (+7 more)

### Community 37 - "Community 37"
Cohesion: 0.21
Nodes (11): metadata, TLoginFormProps, RegisterForm(), TVerifyEmailFormProps, AUTH_ROUTES, Button(), ButtonProps, buttonVariants (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.16
Nodes (18): PickupAddressForm(), Props, PickupLocationControllerSavePersonal200, administrativeDivisionControllerFindAllProvinces(), AdministrativeDivisionControllerFindAllProvincesQueryError, AdministrativeDivisionControllerFindAllProvincesQueryResult, administrativeDivisionControllerFindWardsByProvinceCode(), AdministrativeDivisionControllerFindWardsByProvinceCodeQueryError (+10 more)

### Community 39 - "Community 39"
Cohesion: 0.10
Nodes (17): administrativeDivisionControllerFindAllProvinces(), AdministrativeDivisionControllerFindAllProvincesResult, administrativeDivisionControllerFindWardsByProvinceCode(), AdministrativeDivisionControllerFindWardsByProvinceCodeResult, SecondParameter, cartControllerAdd(), CartControllerAddResult, cartControllerFindMine() (+9 more)

### Community 40 - "Community 40"
Cohesion: 0.15
Nodes (15): axios, @t3-oss/env-nextjs, axiosClient, axiosConfig, authResponses, AuthControllerForgotPasswordResponse, AuthControllerLoginResponse, AuthControllerLogoutResponse (+7 more)

### Community 41 - "Community 41"
Cohesion: 0.19
Nodes (12): cn, @hugeicons/core-free-icons, @hugeicons/react, TermsAgreement(), TTermsAgreementProps, Checkbox(), BaseInputField(), BaseInputFieldProps (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 43 - "Community 43"
Cohesion: 0.13
Nodes (14): ShippingPackagesPage(), getProductControllerFindManagedQueryKey(), getProductControllerFindManagedQueryOptions(), getProductControllerFindMineQueryKey(), getProductControllerFindMineQueryOptions(), getProductControllerReviewQueueQueryKey(), getProductControllerReviewQueueQueryOptions(), productControllerFindManaged() (+6 more)

### Community 44 - "Community 44"
Cohesion: 0.13
Nodes (15): scripts, api:generate, build, check, dev, format, format:check, lint (+7 more)

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (9): useRegister(), src_modules_auth_schemas_index_registerschema, src_modules_auth_schemas_index_resetpasswordschema, src_modules_auth_schemas_index_tregisterinput, registerSchema, TRegisterInput, resetPasswordSchema, useAuthControllerRegister() (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.13
Nodes (14): pickupLocationControllerFindPersonal(), PickupLocationControllerFindPersonalResult, pickupLocationControllerFindShop(), PickupLocationControllerFindShopResult, pickupLocationControllerSavePersonal(), PickupLocationControllerSavePersonalResult, pickupLocationControllerSaveShop(), PickupLocationControllerSaveShopResult (+6 more)

### Community 47 - "Community 47"
Cohesion: 0.25
Nodes (8): nextConfig, next, PackageForm(), labels, CartLink(), availabilityLabels, MarketplaceHeader(), MobileNavigation()

### Community 48 - "Community 48"
Cohesion: 0.21
Nodes (9): @hookform/resolvers, react-hook-form, metadata, ForgotPasswordForm(), useForgotPassword(), useVerifyEmail(), useAuthControllerForgotPassword(), useAuthControllerResendVerification() (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.28
Nodes (9): next-auth, AddToCartAction(), CartProduct, CartPage(), cartQueryKey(), useAddCartItem(), useCart(), useRemoveCartItem() (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (8): metadata, TLoginPageProps, LoginForm(), useLogin(), AUTH_ERROR_MESSAGES, LOGIN_ERROR_MESSAGES, TAuthErrorCode, TLoginErrorCode

### Community 51 - "Community 51"
Cohesion: 0.20
Nodes (6): react, metadata, AuthPageShell(), dmSans, dmSans, LoginShell()

### Community 52 - "Community 52"
Cohesion: 0.18
Nodes (7): src_app_globals, dmSans, geistMono, metadata, AuthProvider(), src_shared_providers_index_authprovider, src_shared_providers_index_queryprovider

### Community 53 - "Community 53"
Cohesion: 0.20
Nodes (10): getUserControllerFindOneQueryKey(), getUserControllerFindOneQueryOptions(), getUserControllerGetMeQueryKey(), getUserControllerGetMeQueryOptions(), userControllerFindOne(), userControllerGetMe(), useUserControllerFindAll(), useUserControllerFindOne() (+2 more)

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (8): architectureZones, eslintConfig, getLayerDirectories(), isolateLayerDirectories(), eslint, eslint-config-next, ref_node_fs, ref_node_path

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (6): zod, TResetPasswordInput, AdministrativeDivisionControllerFindAllProvincesResponse, AdministrativeDivisionControllerFindWardsByProvinceCodeParams, AdministrativeDivisionControllerFindWardsByProvinceCodeResponse, AuthControllerResetPasswordBody

### Community 56 - "Community 56"
Cohesion: 0.33
Nodes (6): auth, config, getProxyDecision(), isAuthRoute(), ProxyDecision, proxy

### Community 57 - "Community 57"
Cohesion: 0.22
Nodes (9): getMediaControllerFindAllQueryKey(), getMediaControllerFindAllQueryOptions(), getMediaControllerFindForManagementQueryKey(), getMediaControllerFindForManagementQueryOptions(), mediaControllerFindAll(), mediaControllerFindForManagement(), useMediaControllerFindAll(), useMediaControllerFindForManagement() (+1 more)

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (9): getShopControllerFindMembersQueryKey(), getShopControllerFindMembersQueryOptions(), getShopControllerFindMineQueryKey(), getShopControllerFindMineQueryOptions(), shopControllerFindMembers(), shopControllerFindMine(), useShopControllerFindMembers(), useShopControllerFindMine() (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.25
Nodes (5): ref_node_url, @testing-library/jest-dom, @testing-library/react, vitest, { replace }

### Community 60 - "Community 60"
Cohesion: 0.25
Nodes (7): ../../tsconfig.json, compilerOptions, incremental, types, exclude, extends, include

### Community 61 - "Community 61"
Cohesion: 0.32
Nodes (5): OAuthButtons(), TOAuthButtonsProps, LogoImage(), TLogoImageProps, Separator()

### Community 62 - "Community 62"
Cohesion: 0.43
Nodes (6): @auth/core/types, JWT, next-auth/jwt, Session, User, AuthControllerLogin200DataUserRole

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (3): metadata, TVerifyEmailPageProps, VerifyEmailForm()

### Community 64 - "Community 64"
Cohesion: 0.40
Nodes (4): PickupAddressPage(), usePickupLocationControllerFindPersonal(), usePickupLocationControllerFindShop(), withQueryKey()

### Community 65 - "Community 65"
Cohesion: 0.50
Nodes (3): hooks, mutator, orval

### Community 67 - "Community 67"
Cohesion: 0.50
Nodes (4): authControllerLogin(), getAuthControllerLoginMutationKey(), getAuthControllerLoginMutationOptions(), useAuthControllerLogin()

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (4): authControllerLogout(), getAuthControllerLogoutMutationKey(), getAuthControllerLogoutMutationOptions(), useAuthControllerLogout()

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (4): authControllerOauth(), getAuthControllerOauthMutationKey(), getAuthControllerOauthMutationOptions(), useAuthControllerOauth()

### Community 70 - "Community 70"
Cohesion: 0.50
Nodes (4): getMediaControllerConfirmUploadMutationKey(), getMediaControllerConfirmUploadMutationOptions(), mediaControllerConfirmUpload(), useMediaControllerConfirmUpload()

### Community 71 - "Community 71"
Cohesion: 0.50
Nodes (4): getMediaControllerCreateUploadTicketMutationKey(), getMediaControllerCreateUploadTicketMutationOptions(), mediaControllerCreateUploadTicket(), useMediaControllerCreateUploadTicket()

### Community 72 - "Community 72"
Cohesion: 0.50
Nodes (4): getMediaControllerDeleteMutationKey(), getMediaControllerDeleteMutationOptions(), mediaControllerDelete(), useMediaControllerDelete()

### Community 73 - "Community 73"
Cohesion: 0.50
Nodes (4): getMediaControllerSetCoverMutationKey(), getMediaControllerSetCoverMutationOptions(), mediaControllerSetCover(), useMediaControllerSetCover()

### Community 74 - "Community 74"
Cohesion: 0.50
Nodes (4): getMediaControllerUpdateMetadataMutationKey(), getMediaControllerUpdateMetadataMutationOptions(), mediaControllerUpdateMetadata(), useMediaControllerUpdateMetadata()

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (4): getProductControllerFindOneQueryKey(), getProductControllerFindOneQueryOptions(), productControllerFindOne(), useProductControllerFindOne()

### Community 76 - "Community 76"
Cohesion: 0.50
Nodes (4): getProductControllerReviewDetailQueryKey(), getProductControllerReviewDetailQueryOptions(), productControllerReviewDetail(), useProductControllerReviewDetail()

### Community 77 - "Community 77"
Cohesion: 0.50
Nodes (4): getProductControllerReviewHistoryQueryKey(), getProductControllerReviewHistoryQueryOptions(), productControllerReviewHistory(), useProductControllerReviewHistory()

### Community 78 - "Community 78"
Cohesion: 0.50
Nodes (4): getProductControllerRevisionsQueryKey(), getProductControllerRevisionsQueryOptions(), productControllerRevisions(), useProductControllerRevisions()

### Community 79 - "Community 79"
Cohesion: 0.50
Nodes (4): getProductControllerSubmitMutationKey(), getProductControllerSubmitMutationOptions(), productControllerSubmit(), useProductControllerSubmit()

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (4): getProductControllerSuspendMutationKey(), getProductControllerSuspendMutationOptions(), productControllerSuspend(), useProductControllerSuspend()

### Community 81 - "Community 81"
Cohesion: 0.50
Nodes (4): getShopControllerAddStaffMutationKey(), getShopControllerAddStaffMutationOptions(), shopControllerAddStaff(), useShopControllerAddStaff()

### Community 82 - "Community 82"
Cohesion: 0.50
Nodes (4): getShopControllerCreateMutationKey(), getShopControllerCreateMutationOptions(), shopControllerCreate(), useShopControllerCreate()

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (4): getShopControllerFindAllQueryKey(), getShopControllerFindAllQueryOptions(), shopControllerFindAll(), useShopControllerFindAll()

### Community 84 - "Community 84"
Cohesion: 0.50
Nodes (4): getShopControllerFindOneQueryKey(), getShopControllerFindOneQueryOptions(), shopControllerFindOne(), useShopControllerFindOne()

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (4): getShopControllerUpdateStaffMutationKey(), getShopControllerUpdateStaffMutationOptions(), shopControllerUpdateStaff(), useShopControllerUpdateStaff()

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (4): getUserControllerCreateMutationKey(), getUserControllerCreateMutationOptions(), userControllerCreate(), useUserControllerCreate()

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (4): getUserControllerUpdateMeMutationKey(), getUserControllerUpdateMeMutationOptions(), userControllerUpdateMe(), useUserControllerUpdateMe()

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (4): getUserControllerUpdateMutationKey(), getUserControllerUpdateMutationOptions(), userControllerUpdate(), useUserControllerUpdate()

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (3): lint-staged, *.{js,jsx,ts,tsx}, *.{json,css,md}

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (3): getUserControllerFindAllQueryKey(), getUserControllerFindAllQueryOptions(), userControllerFindAll()

## Knowledge Gaps
- **2340 isolated node(s):** `AdministrativeDivisionControllerFindAllProvinces200DataItem`, `AdministrativeDivisionControllerFindAllProvinces200StatusCode`, `AdministrativeDivisionControllerFindWardsByProvinceCode200DataItem`, `AdministrativeDivisionControllerFindWardsByProvinceCode200StatusCode`, `AuthControllerForgotPassword200Data` (+2335 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2382 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `zod` connect `Community 55` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 40`, `Community 45`, `Community 14`, `Community 15`, `Community 13`, `Community 50`, `Community 19`, `Community 20`, `Community 21`, `Community 26`?**
  _High betweenness centrality (0.393) - this node is a cross-community bridge._
- **Why does `@tanstack/react-query` connect `Community 21` to `Community 33`, `Community 38`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 47`, `Community 49`, `Community 50`, `Community 18`, `Community 17`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `orvalRequest()` connect `Community 11` to `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 16`, `Community 17`, `Community 18`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 28`, `Community 29`, `Community 31`, `Community 36`, `Community 38`, `Community 39`, `Community 40`, `Community 43`, `Community 46`, `Community 53`, `Community 57`, `Community 58`, `Community 67`, `Community 68`, `Community 69`, `Community 70`, `Community 71`, `Community 72`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 77`, `Community 78`, `Community 79`, `Community 80`, `Community 81`, `Community 82`, `Community 83`, `Community 84`, `Community 85`, `Community 86`, `Community 87`, `Community 88`, `Community 90`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `AdministrativeDivisionControllerFindAllProvinces200DataItem`, `AdministrativeDivisionControllerFindAllProvinces200StatusCode`, `AdministrativeDivisionControllerFindWardsByProvinceCode200DataItem` to the rest of the system?**
  _2340 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0026954177897574125 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.00423728813559322 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.011299435028248588 - nodes in this community are weakly interconnected._