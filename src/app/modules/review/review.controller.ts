import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { ReviewServices } from "./review.service";
import httpstatus from "http-status"
import pick from "../../helper/pick";
import { reviewFilterableFields } from "./review.constant";
import httpStatus from "http-status"


const inserIntoDB = catchAsync(async(req: Request & {user?: IJWTPayload}, res: Response) => {
    const user = req.user;
    const result = await ReviewServices.inserIntoDB(user as IJWTPayload, req.body);

    sendResponse(res,{
        statusCode: httpstatus.OK,
        success: true,
        message: "Review created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, reviewFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ReviewServices.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

export const ReviewController = {
    inserIntoDB,
    getAllFromDB
}