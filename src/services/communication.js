import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";

const nodeEnvironment = process.env.NEXT_PUBLIC_NODE_ENV;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const tokenName = process.env.NEXT_PUBLIC_TOKENNAME;

export function getServerUrl() {
  if (nodeEnvironment === "development") {
    return serverUrl;
  }

  if (nodeEnvironment === "machine_IP") {
    return serverUrl;
  }

  if (nodeEnvironment === "server") {
    return serverUrl;
  }

  return serverUrl;
}

export const communication = {
  login: async function (dataToSend) {
    try {
      return axios.post(`${getServerUrl()}/user/login`, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
  // ---------------Report-----------------------------------
  MaterialByCategory: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/report/get-category-count`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  MaterialByBrand: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/report/get-brand-count`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  MaterialByStockStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/report/get-stock-status-count`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  MaterialByLocation: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/report/get-location-count`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getStockOutCount: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/report/get-stock-out-count`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //?----------Role Management-------------------------------
  createRole: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/create-role`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
  getRoleList: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/role/get-role-list`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      toast.error(error.message);
    }
  },
  deleteRole: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/delete-role`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
  getRoleById: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/get-role-by-id`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
  updateRole: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/update-role`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
  getActiveRole: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/get-active-role`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
  //-----------Category--------------------
  createCategory: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/create-category`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getAllCategory: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/get-all-category`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteCategory: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/delete-category`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getCategoryById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/get-category-by-id`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateCategory: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/update-category`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //----------------------------Block Api----------------------
  getLocations: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-all-location`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  createBlock: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/create-block`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getBlockList: async (page = 1, searchString = "") => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/block/get-all-block`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getActiveBlock: async (page = 1, searchString = "") => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/get-active-block`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  deleteBlock: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/delete-block`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getBlockById: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/get-block-by-id`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  updateBlock: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/update-block`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  changeBlockStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/block/change-block-status`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //
  //?---------------------PO Management ---------------------------------------------
  getPoList: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-po-list`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
  getStockOutMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-completed-po-list`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getStockList: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-stock-list`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getActiveCategory: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/category/get-active-category`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getActiveBrand: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/get-active-brand`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getCategoryWiseBrand: async (categoryId) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/brand/get-category-wise-brand`,
        { categoryId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  createPo: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/generate-po`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  updatePo: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/update-po`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  receiveMaterialPo: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/recived-material-of-po`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getPoById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-po-by-id`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deletePo: async function (poId) {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/delete-po`,
        { poId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  receiveMaterialPo: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/recived-material-of-po`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  // ------------------------------location------------------------
  createLocation: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/create-location`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocation: async () => {
    try {
      return await axios.get(
        // " https://imsbackend.rsinfotechsys.com/location/get-all-location",
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-all-location`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocationList: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-location-list`,
        { page, searchString },

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocationById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-location-by-id`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateLocationById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/update-location`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  changeLocationStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/change-location-status`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteCompletedPo: async function (poId) {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/delete-completed-po`,
        { poId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //?---------------------Inventory Look ---------------------------------------------

  getInventoryMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-material-for-inventory`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  stockOutMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/stock-out-material`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //?------------------------Brand-----------------------------
  getAllBrand: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/get-all-brand`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  createBrand: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/create-brand`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getBrandById: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/get-brand-by-id`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  updateBrand: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/update-brand`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  deleteBrand: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/delete-brand`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  ///user roshan arikar//
  getUserList: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/get-user-list`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocations: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-all-location`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  createUser: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/create-user`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getUserById: async (userId) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/get-user-by-id`,
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateUser: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/update-user`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  deleteUser: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/delete-user`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  changeUserStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/change-user-change`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getProductList: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/model/get-model-list`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  deleteModel: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/model/delete-model`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getProductById: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/model/get-model-by-id`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  createProduct: async (formData) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/model/create-model`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateProduct: async (isFileAttached, formData) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/model/update-model?isFileAttached=${isFileAttached}`,
        formData,
        {
          headers: {
            "Content-Type": isFileAttached ? "multipart/form-data" : "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getUserAccessTab: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/get-user-access-tab`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
  // -------------------------stock in api-----------------------
  brandWiseModel: async (id) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/model/get-brand-wise-model`,
        id,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocationWiseBlock: async (locationId) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/block/get-location-wise-block`,
        { locationId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  stockIn: async (dataToSend) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/stock-in`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getStockById: async (stockId) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-stock-by-id`,
        { stockId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateStock: async (dataToSend) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/update-stock`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
///stock management
  fetchReturnMaterialList: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/fetched-return-material-list`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getReturnMaterialById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-assigned-material-by-id`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateStockBeforeAccept: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/accept-updated-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getRackPartation: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-rack-partition`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getParameters: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/get-parameters`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getParameterById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/get-parameter-by-id`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  rejectMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/reject-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //Notification
  getAllNotification: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/get-all-notification`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getNotificationCount: async (data) => {
    try {
      return await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/get-notification-count`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteNotification: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/delete-notification`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteSelectedNotification: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/delete-selected-notification`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteAllNotification: async (data) => {
    try {
      return await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/delete-all-notification`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  // ----------------------------NR material API-----------------------------------
  getNrMaterialList: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/nr/get-non-replacable-stock-list`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  /////////////////////////sakshi assign material//////////////////////////////////////
  // ------------------material-------------------
  getMaterialList: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-material-list`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  sellNrMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/nr/sell-non-replacable-stock`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  getCategoryWiseParameter: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-category-wise-parameter-for-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  // ----------------------------Stock-Out material API-----------------------------------
  getStockOutMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/fetched-stock-out-materials`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  getTechnicianList: async () => {
    try {
      return await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-technician`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  AssignMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/assigned-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  // -----------------------Transfer Material------------------------------------
  getTransferMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-transfer-material-list`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getReceiveMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-receive-material-list`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  transferMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/transfer-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getActiveLocation: async () => {
    try {
      return await axios.get(
        // " https://imsbackend.rsinfotechsys.com/location/get-all-location",
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-active-locations`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getTransferMaterialDetails: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-transfer-material-by-id`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  // aproval ///////
  getMaterialForApproval: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-material-for-approval`,
data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  // --------------------------------receive material------------------------------------------------
  getRackPartation: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-rack-partition`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  approveTransferMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-tranfer-material-for-approval`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  updateStockAfterReceive: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/updated-receive-material`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  changeMaterialStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/change-material-status`,
        data,   
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  updateStockAfterReceive: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/updated-receive-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getTransferMaterialById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-transfer-material-by-id`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  ////////////////////////////////end////////////////////////////////////////////
};
