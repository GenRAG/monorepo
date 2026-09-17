import { useGetMeQuery } from "services/auth/auth";

const useAuthentification = () => {
    const { data: userData, isLoading: isUserLoading, isSuccess, isFetching: isUserFetching } = useGetMeQuery();

    const isLoading = isUserLoading || isUserFetching;
    const isAuthenticated = !isLoading && !!userData && isSuccess;

    return { isAuthenticated, isLoading, userData };
};

export default useAuthentification;
