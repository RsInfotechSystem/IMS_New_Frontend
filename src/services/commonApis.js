import { toast } from "react-toastify";
import { communication } from "./communication";

export async function getCategory(setLoader, router, setCategory = []) {
  try {
    const serverResponse = await communication.getActiveCategory();
    if (serverResponse?.data?.status === "SUCCESS") {
      return serverResponse?.data?.category;
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.info(serverResponse.data.message);
      router.push("/");
    } else {
      return [];
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
  }
}

export async function getBrands(router) {
  try {
    const serverResponse = await communication.getActiveBrand();
    if (serverResponse?.data?.status === "SUCCESS") {
      return serverResponse?.data?.brand;
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.info(serverResponse.data.message);
      router.push("/");
    } else {
      return [];
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
  }
}

export async function getCategoryWiseBrand(categoryId, setLoader, router, setBrandsData = []) {
  try {
    
    const serverResponse = await communication.getCategoryWiseBrand(categoryId);
    if (serverResponse?.data?.status === "SUCCESS") {
      setBrandsData(serverResponse?.data?.brand);
      return serverResponse?.data?.brand;
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.info(serverResponse.data.message);
      router.push("/");
    } else {
      return [];
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
  }
}

export async function getUserAccessTabs(router) {
  try {
    const serverResponse = await communication.getUserAccessTab();
    if (serverResponse?.data?.status === "SUCCESS") {
      return serverResponse?.data?.tab;
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.info(serverResponse.data.message);
      router.push("/");
    } else {
      return [];
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
  }
}

export async function getLocationWiseBlock(locationId, setLoader, router, setBlocks = []) {
  try {
    setLoader(true);
    const serverResponse = await communication.getLocationWiseBlock(locationId);
    if (serverResponse?.data?.status === "SUCCESS") {
      // return serverResponse?.data?.block;
      setBlocks(serverResponse?.data?.block);
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.warn(serverResponse.data.message);
      router.push("/");
      setLoader(false);
    } else {
      setBlocks([]);
      // return [];
    }
    setLoader(false);
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
    setLoader(false);
  }
}
