import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {type: String, required: true, unique: true}, // Auth0 "sub"
    email: {type: String, required: true},
    name: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const UserModel = mongoose.model('User', userSchema);

export type User = mongoose.InferSchemaType<typeof userSchema>;