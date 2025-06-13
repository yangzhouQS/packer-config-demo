import { $http } from "@cs/js-inner-web-framework";

export const apiUser = {
  queryOperatorList: (params: Record<string, any>) => {
    return $http.post(`sys-operator/query-params`, params);
  },
  queryPhoneUser: (phoneNumber: string) => {
    return $http.get(`sys-operator/${phoneNumber}/query-phone-user`);
  },
  removeOperatorUser: (params: Record<string, any>) => {
    console.log("params", params);
    return $http.post(`sys-operator/remove-operator-user`, params);
  },
};
