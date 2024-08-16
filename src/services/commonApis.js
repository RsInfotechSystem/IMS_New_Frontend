import { toast } from "react-toastify";
import { communication } from "./communication";
import Swal from "sweetalert2";

export async function getCategory(setLoader, router = [], setCategory = []) {
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
export async function getLocations(setLoader, router, setLocations = [], isReturn = false) {
  try {
    setLoader?.(true);
    const serverResponse = await communication.getLocations();
    if (serverResponse?.data?.status === "SUCCESS") {
      setLocations(serverResponse?.data?.result);
      setLoader?.(false);
      if (isReturn) {
        return serverResponse?.data?.result;
      }
      setLoader?.(false);
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.info(serverResponse.data.message);
      router.push("/");
      setLoader?.(false);
    } else {
      // setLocations([]);
      return [];
    }
    setLoader?.(false);
  } catch (error) {
    toast.info(error?.response?.data?.message || error.message);
    // setLoader(false);
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
export async function getParameter(setLoader, router, setParameter = [], isReturn = false) {
  try {
    setLoader(true);
    const serverResponse = await communication.getParameters();
    if (serverResponse?.data?.status === "SUCCESS") {
      setParameter(serverResponse?.data?.parameter);
      setLoader(false);
      if (isReturn) {
        setLoader(false);
        return serverResponse?.data?.parameter;
      }
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.info(serverResponse.data.message);
      router.push("/");
      setLoader(false);
    } else {
      setParameter([]);
    }
    setLoader(false);
  } catch (error) {
    toast.info(error?.response?.data?.message || error.message);
    setLoader(false);
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

export async function getLocationWiseBlock(
  locationId,
  setLoader,
  router,
  setBlocks = [],
  isReturn = false
) {
  try {
    setLoader(true);
    const serverResponse = await communication.getLocationWiseBlock(locationId);
    if (serverResponse?.data?.status === "SUCCESS") {
      // return serverResponse?.data?.block;
      setBlocks(serverResponse?.data?.block);
      if (isReturn) {
        setLoader(false);

        return serverResponse?.data?.block;
      }
      setLoader(false);
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
    // setLoader(false);
  }
}
export async function getRackPartation(
  id,
  setLoader,
  router,
  setRackPartation = [],
  isReturn = false
) {
  try {
    setLoader(true);
    const serverResponse = await communication.getRackPartation({
      rackId: id,
    });
    if (serverResponse?.data?.status === "SUCCESS") {
      setRackPartation(serverResponse?.data?.filteredPartitions);
      if (isReturn) {
        setLoader(false);
        return serverResponse?.data?.filteredPartitions;
      }
      setLoader(false);
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.info(serverResponse.data.message);
      router.push("/");
      setLoader(false);
    } else {
      setRackPartation([]);
    }
    setLoader(false);
  } catch (error) {
    toast.info(error?.response?.data?.message || error.message);
    setLoader(false);
  }
}

export async function getBrandWiseModel(brandId, setLoader, router, setModel, isReturn = false) {
  try {
    // props.setLoader(true);
    setLoader(true);
    const payload = {
      brandId: brandId,
    };
    const serverResponse = await communication.brandWiseModel(payload);
    if (serverResponse?.data?.status === "SUCCESS") {
      setModel(serverResponse?.data?.model);
      setLoader(false);
      if (isReturn) {
        return serverResponse?.data?.model;
      }
      setLoader(false);
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      toast.warn(serverResponse.data.message);
      router.push("/");
      setLoader(false);
    } else {
      setModel([]);
    }
    setLoader(false);
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
  }
}
