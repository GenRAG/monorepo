"""
costs.py

REST API endpoints for cost tracking and reporting.
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import verify_api_key
from app.services.cost_tracker import cost_tracker
from app.schemas.cost import CostDetailsResponse, CostSummaryResponse

router = APIRouter(prefix="/costs", dependencies=[Depends(verify_api_key)])


@router.get("/summary", response_model=CostSummaryResponse)
async def get_cost_summary(
    org_id: str = Query(..., description="Organization ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
):
    """
    Aggregate costs for an org over the specified period.

    Returns total cost, breakdown by model, by type (embedding/generation/reranking),
    and by model+type.
    """
    if not org_id.strip():
        raise HTTPException(status_code=422, detail="org_id is required")

    summary = await cost_tracker.query_summary(org_id=org_id, days=days)

    now = datetime.utcnow()
    return CostSummaryResponse(
        org_id=org_id,
        period_days=days,
        from_date=now - timedelta(days=days),
        to_date=now,
        summary=summary,
    )


@router.get("/details", response_model=CostDetailsResponse)
async def get_cost_details(
    org_id: str = Query(..., description="Organization ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    model: Optional[str] = Query(None, description="Filter by model name"),
    cost_type: Optional[str] = Query(
        None, description="Filter by cost type (embedding, generation, reranking)"
    ),
    limit: int = Query(100, ge=1, le=10000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
):
    """
    Return raw cost records with optional filtering and pagination.

    Records are sorted newest-first.
    """
    if not org_id.strip():
        raise HTTPException(status_code=422, detail="org_id is required")

    records = await cost_tracker.query(
        org_id=org_id,
        days=days,
        model_filter=model,
        type_filter=cost_type,
        limit=limit,
        offset=offset,
    )

    return CostDetailsResponse(
        records=records,
        total=len(records),
    )