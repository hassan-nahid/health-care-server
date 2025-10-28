import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { ReviewServices } from "./review.service";
import httpstatus from "http-status"


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


export const ReviewController = {
    inserIntoDB
}