import { useEffect, useState } from "react";
import { useGetMeQuery } from "services/auth/auth";

const useAuthentification = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { data: userData, isLoading: isUserLoading, isSuccess, isFetching: isUserFetching } = useGetMeQuery();

    useEffect(() => {
        if (isUserLoading || isUserFetching) {
            setIsLoading(true);
        } else if (userData && isSuccess) {
            setIsAuthenticated(true);
            setIsLoading(false);
        } else {
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, [userData, isUserLoading, isUserFetching, isSuccess]);

    return { isAuthenticated, isLoading, userData };
};

export default useAuthentification;
