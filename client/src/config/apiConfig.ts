import {getOriginAndTenantId} from "@/utils/cookieUtils.ts";


export const getTenantId = (): string => {
    const cookieData = getOriginAndTenantId();
    return cookieData?.tenantId ?? "localhost";
};

export const getOrigin = (): string => {
    const cookieData = getOriginAndTenantId();
    let baseOrigin = cookieData?.origin;

    if (!baseOrigin && typeof window !== "undefined") {
        baseOrigin = window.location.origin;
    }

    if (!baseOrigin) return "";
    if (baseOrigin.includes("localhost")) {
        const port = import.meta.env.VITE_API_PORT;
        return `http://localhost:${port}/v1`;
    }

    // For production, ensure the URL is valid
    if (!baseOrigin.startsWith("http")) {
        baseOrigin = `https://${baseOrigin}`;
    }

    // Will throw if baseOrigin is not a valid URL
    const url = new URL(baseOrigin);
    return `${url.protocol}//${url.hostname}/itemservice/api/v1`;
};

// Deprecated: Use getTenantId() instead for dynamic tenant ID from cookies
export const TENANT_ID = "localhost";

export const getApiBase = () => getOrigin() || "";
export const getApiBasePath = () => `${getApiBase()}/dms`;

// 2. Create a function that calculates the URL map
export const getApiUrls = () => {
    const BASE_PATH = getApiBasePath();

    return {
        externalSystemSearch: `${BASE_PATH}/mm/search/externalSystem`,
        dashboardSummary: `${BASE_PATH}/summary/dashboard`,
        itemSearch: `${BASE_PATH}/mm/search/material`,
        itemHierarchy: `${BASE_PATH}/material/hierarchy`,
        itemSummary: `${BASE_PATH}/material/summary`,
        createProject: `${BASE_PATH}/projects`,
        projectPageData: `${BASE_PATH}/projects/page-data`,
        bomDetails: `${BASE_PATH}/bom/detail`,
        bomWidgetSummary: `${BASE_PATH}/bom/summary`,
        bomRequirement: `${BASE_PATH}/sourcing-list/bom-requirement`,
        createSourcingList: `${BASE_PATH}/sourcing-list`,
        sourcingListSearch: `${BASE_PATH}/sourcing-list/search`,
        sourcingListMaterial: `${BASE_PATH}/sourcing-list/material`,
        sourcingListItemTypePreview: `${BASE_PATH}/sourcing-list/item-type/preview`,
        commodityMappings: `${BASE_PATH}/sourcing-list/commodity-mappings`,
        fetchSourcingEvents: `${BASE_PATH}/sourcing-event/search`,
        createSourcingEvent: `${BASE_PATH}/sourcing-event`,
        updateAndDeleteSourcingListMaterial: `${BASE_PATH}/sourcing-list/material-requirement`,
        fetchAccessToken: `${BASE_PATH}/oauth2-proxy/access_token`,
        fetchRefreshToken: `${BASE_PATH}/oauth2-proxy/refresh_token`,
        revokeToken: `${BASE_PATH}/oauth2/revoke`,
        fetchMenuBarConfig: `${BASE_PATH}/menu-bar-config`,
        fetchGlobalNavigation: `${BASE_PATH}/global_navigations`,
        getOAuthProviderUrl: `${BASE_PATH}/oauth2-proxy/provider-url`,
        getSourcingListById: `${BASE_PATH}/sourcing-list/detail`,
        fetchBomRequirements: `${BASE_PATH}/sourcing-list/bom-requirement/detail`,
        updateSourcingList: (id: number) => `${BASE_PATH}/sourcing-list/${id}`,
        deleteSourcingList: `${BASE_PATH}/sourcing-list`,
        fileDetails: `${BASE_PATH}/files`,
        fileType: `${BASE_PATH}/file/type`,
        downloadFileTemplate: `${BASE_PATH}/file/samplezip`,
        uploadERPData: `${BASE_PATH}/file/zip`,
        createExternalSystem: `${BASE_PATH}/externalSystem`,
        getExternalSystem: `${BASE_PATH}/mm/search/externalSystem`,
        downloadJobZip: `${BASE_PATH}/file/downloadzip`,
        fileDetailsByJobId: `${BASE_PATH}/file`,
        searchCompany: `${BASE_PATH}/mm/search/company`,
        searchItem: `${BASE_PATH}/mm/search/material`,
        searchPlant: `${BASE_PATH}/mm/search/plant`,
        searchPurchaseOrg: `${BASE_PATH}/mm/search/purchaseOrg`,
        searchItemGroup: `${BASE_PATH}/mm/search/materialGroup`,
        searchItemtype: `${BASE_PATH}/mm/search/materialType`,
        searchPurchaseGroup: `${BASE_PATH}/mm/search/purchaseGroup`,
        searchItemPlant: `${BASE_PATH}/mm/search/material-plant`,
        searchBom: `${BASE_PATH}/bom/search`,
        searchCustomFields: `${BASE_PATH}/mm/search/customFields`,
        externalSystemSearchDropdown: `${BASE_PATH}/mm/search/externalSystemDropdown`,
        markets: `${BASE_PATH}/cso/markets`,
        classifications: `${BASE_PATH}/cso/classifications`,
        currencies: `${BASE_PATH}/cso/currencies`,
        timezones: `${BASE_PATH}/cso/timezones`,
        itemTypeSearch: `${BASE_PATH}/item-type/search`,
        itemTypeCreate: `${BASE_PATH}/item-type`,
        itemTypeFields: `${BASE_PATH}/item-type/fields`,
        itemTypeFlexGroups: `${BASE_PATH}/item-type/flex-group`,
        itemTypeByIdAndCode: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}`,
        itemTypeStatus: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/status`,
        itemTypeDefaultFetch: `${BASE_PATH}/item-type/default`,
        itemTypeAttributes: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/attributes`,
        itemTypeAttributesByGroup: (itemTypeId: string | number, itemTypeCode: string, groupCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/attributes/${groupCode}`,
        itemTypeAttributesOrder: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/attributesOrder`,
        itemTypeAddMoreAttributesGet: (itemTypeId: string | number, itemTypeCode: string, flexGroupCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/${flexGroupCode}/addMoreAttributes`,
        itemTypeAddMoreAttributesPost: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/addMoreAttributes`,
        itemTypeDeterminationLookup: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/determination/lookup`,
        itemTypeDetermination: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/determination`,
        itemTypeDeterminationPreview: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/determination/preview`,
        itemTypeDeterminationItemPlants: (itemTypeId: string | number, itemTypeCode: string) =>
            `${BASE_PATH}/item-type/${itemTypeId}/${itemTypeCode}/determination/item-plants`,
        attributesCreate: `${BASE_PATH}/attributes`,
        attributesUpdate: (attributeId: string | number, attributeCode: string) =>
            `${BASE_PATH}/attributes/${attributeId}/${attributeCode}`,
        attributesSearch: `${BASE_PATH}/attributes/search`,
        userPermissions: `${BASE_PATH}/user-permissions`,
    };
};

type ApiUrlMap = ReturnType<typeof getApiUrls>;

const urlsProxy = new Proxy({} as ApiUrlMap, {
    get(_target, prop) {
        const runtimeUrls = getApiUrls();
        return runtimeUrls[prop as keyof ApiUrlMap];
    },
});

export const API_URLS = urlsProxy;

export const API_CONFIG = {
    TENANT_ID,
    API_URLS,
};