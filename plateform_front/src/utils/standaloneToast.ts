import { createStandaloneToast } from "@chakra-ui/react";

import theme from "../themeNew";

const { ToastContainer, toast } = createStandaloneToast({ theme });

export { ToastContainer };
export default toast;
