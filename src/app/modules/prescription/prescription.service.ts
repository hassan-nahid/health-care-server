import { AppointmentStatus, PaymentStatus, Prescription, UserRole } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from 'http-status'
import { IOptions, paginationHelper } from "../../helper/peginationHelper";

const createPrescription = async (user: IJWTPayload, payload: Partial<Prescription>) => {
    // payload uses Prisma's Prescription fields which (in schema) are named
    // 'appointementId' and 'followUpdate' (note the existing typos in schema).
    // Accept either spelling from callers by reading from payload as any.
    const raw = payload as any;
    const appointmentId = raw.appointmentId ?? raw.appointementId;

    if (!appointmentId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "appointmentId is required")
    }

    // Use findFirstOrThrow so we can filter by status and paymentStatus together
    const appointmentData = await prisma.appointment.findFirstOrThrow({
        where: {
            id: appointmentId,
            status: AppointmentStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID
        },
        include: {
            doctor: true
        }
    })

    if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email))
            throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment")
    }

    const followUpdateValue = raw.followUpdate ?? raw.followUpDate ?? null;

    const result = await prisma.prescription.create({
        data: {
            // Prisma schema expects 'appointementId' and 'followUpdate'
            appointementId: appointmentData.id,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions as string,
            followUpdate: followUpdateValue
        },
        include: {
            patient: true
        }
    });

    return result;
}

const patientPrescription = async (user: IJWTPayload, options: IOptions) => {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const result = await prisma.prescription.findMany({
        where: {
            patient: {
                email: user.email
            }
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctor: true,
            patient: true,
            appointment: true
        }
    })

    const total = await prisma.prescription.count({
        where: {
            patient: {
                email: user.email
            }
        }
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }

};


export const PrescriptionService = {
    createPrescription,
    patientPrescription
}