import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs"
import { fileUploader } from "../../helper/fileUploader";
import { Admin, Doctor, Prisma, UserRole } from "@prisma/client";
import { paginationHelper } from "../../helper/peginationHelper";
import { userSearchableFields } from "./user.constant";

const createPatient = async (req: Request) => {
    if (req.file) {
        const uploadedResult = await fileUploader.uploadToCloudinary(req.file)
        req.body.patient.profilePhoto = uploadedResult?.secure_url
        console.log(uploadedResult)
    }
    const hashPassword = await bcrypt.hash(req.body.password, Number(config.salt_round))
    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: req.body.patient.email,
                password: hashPassword
            }
        });

        return await tnx.patient.create({
            data: req.body.patient
        })
    })

    return result;
}

const createAdmin = async (req: Request): Promise<Admin> => {

    const file = req.file;

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.admin.profilePhoto = uploadToCloudinary?.secure_url
    }

    const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

    const userData = {
        email: req.body.admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData
        });

        const createdAdminData = await transactionClient.admin.create({
            data: req.body.admin
        });

        return createdAdminData;
    });

    return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {

    const file = req.file;

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url
    }
    const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

    const userData = {
        email: req.body.doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData
        });

        const createdDoctorData = await transactionClient.doctor.create({
            data: req.body.doctor
        });

        return createdDoctorData;
    });

    return result;
};

const getAllFromDB = async (params: any, options: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params

    const andCondition: Prisma.UserWhereInput[] = [];
    if (searchTerm) {
        andCondition.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if(Object.keys(filterData).length > 0){
        andCondition.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    const whereConditons: Prisma.UserWhereInput = andCondition.length > 0 ? {
        AND: andCondition
    }
: {}
    const result = await prisma.user.findMany({
        skip,
        take: limit,
        where: whereConditons,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = await prisma.user.count({
        where: whereConditons
    })
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    }
}

export const UserService = {
    createPatient,
    createAdmin,
    createDoctor,
    getAllFromDB
}