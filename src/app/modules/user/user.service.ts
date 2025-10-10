import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs"
import { fileUploader } from "../../helper/fileUploader";

const createPatient = async (req: Request) => {
    if(req.file){
        const uploadedResult = await fileUploader.uploadToCloudinary(req.file)
        req.body.patient.profilePhoto = uploadedResult?.secure_url 
        console.log(uploadedResult)
    }
    const hashPassword = await bcrypt.hash(req.body.password, Number(config.salt_round))
    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: req.body.patient.email,
                password: hashPassword,
            }
        });

        await tnx.patient.create({
            data: req.body.patient
        })
    })
    return result
}


export const UserService = {
    createPatient
}