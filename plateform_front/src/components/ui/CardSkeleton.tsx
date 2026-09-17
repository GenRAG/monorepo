import { Skeleton } from "@chakra-ui/react";

interface CardSkeletonProps {
    height: number;
}

export const CardSkeleton = ({ height }: CardSkeletonProps) => (
    <Skeleton height={`${height}px`} borderRadius="12px" startColor="skeletonStart" endColor="skeletonEnd" />
);
