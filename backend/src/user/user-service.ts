import {UserModel} from './user-model';

export class UserService {
    static async upsert(userData: { id: string; email: string; name?: string }) {
        const now = new Date();
        const update: any = {
            email: userData.email,
            updatedAt: now,
        };
        if (userData.name !== undefined) {
            update.name = userData.name;
        }

        const user = await UserModel.findOneAndUpdate(
            {id: userData.id},
            {
                $set: update,
                $setOnInsert: {createdAt: now},
            },
            {upsert: true, new: true}
        );

        return user;
    }

    static async getById(id: string) {
        return UserModel.findOne({id});
    }
}
