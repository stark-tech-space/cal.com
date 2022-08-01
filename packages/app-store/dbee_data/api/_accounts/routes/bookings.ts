import express, { Request, Response } from "express";
import prisma from "@calcom/prisma";
import { firestore } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import add from 'date-fns/add'

const router = express.Router();

router.patch('/status', async (req: Request, res: Response) => {
  if (!Array.isArray(req.query.args)) {
    return res.status(400).send('invalid path');
  }

  try {
    const bookingId = req.query.args[4];
    // update cal booking status
    const booking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: {
        status: req.body.status
      }
    });

    // update firestore appointment status
    const appointmentsSnap = await firestore.collection("appointments").where("calBookingId", "==", bookingId).limit(1).get();
    if (appointmentsSnap.docs.length > 0) {
      const appointmentSnap = appointmentsSnap.docs[0];
      const appointmentRef = appointmentSnap.ref;
      await appointmentRef.update({
        status: req.body.status
      });
    }
  } catch (error) {
    res.status(500).send('internal error');
  }
});

export default router;
