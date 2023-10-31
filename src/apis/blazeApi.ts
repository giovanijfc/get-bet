import axios from "axios";
import { env } from "../constants/env";

const blazeApi = axios.create({
  baseURL: env.BASE_URL_BLAZE_API,
});

export default blazeApi;
