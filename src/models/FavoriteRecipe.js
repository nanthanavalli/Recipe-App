import mongoose from 'mongoose';

const FavoriteRecipeSchema = new mongoose.Schema({
    mealId: { type: String, required: true },
    mealName: { type: String, required: true },
    imageUrl: { type: String, required: true },
});

export default mongoose.models.FavoriteRecipe || mongoose.model('FavoriteRecipe', FavoriteRecipeSchema);
