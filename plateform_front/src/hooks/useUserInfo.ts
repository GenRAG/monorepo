import { useGetMeQuery } from "services/auth/auth";

export const useUserInfo = () => {
    const { data, error, isLoading, refetch, isFetching, isSuccess } =
        useGetMeQuery();

    const id = data?.id ?? "";
    const name = data?.name ?? "";
    const email = data?.email ?? "";
    const createdAt = data?.createdAt ?? "";
    const updatedAt = data?.updatedAt ?? "";

    return {
        id,
        name,
        email,
        createdAt,
        updatedAt,
        error,
        isLoading,
        isFetching,
        isSuccess,
        refetch,
    };
};
