import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { User } from '../models/user';
import { BadRequestError } from '@axmztickets/common';
import jwt from 'jsonwebtoken'
import { validateRequest } from '@axmztickets/common';

const router = express.Router();

router.post(
    '/api/users/signup',
    [
        body("email").isEmail().withMessage("Invalid email address"),
        body("password").trim().isLength({ min: 4, max: 20 }).withMessage("Invalid password. Must be btw 4 and 20 chars"),
    ], validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            throw new BadRequestError("Email in use")
        }

        const user = User.build({ email, password })
        await user.save()

        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!)

        req.session = {
            jwt: userJwt
        }

        res.status(201).send(user)
    })

export { router as signUpRouter } 