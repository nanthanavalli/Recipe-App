import connectToDatabase from '../../lib/mongodb';
import FavoriteRecipe from '../../models/FavoriteRecipe';

export default async function handler(req, res) {
  // Connect to MongoDB
  await connectToDatabase();

  if (req.method === 'GET') {
    // Retrieve all favorite meals from MongoDB
    try {
      const favorites = await FavoriteRecipe.find({});
      return res.status(200).json(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return res.status(500).json({ message: 'Error fetching favorites' });
    }
  }

  if (req.method === 'POST') {
    const { mealId, mealName, imageUrl } = req.body;

    try {
      // Check if the recipe already exists in favorites
      const existingMeal = await FavoriteRecipe.findOne({ mealId });
      if (existingMeal) {
        return res.status(400).json({ message: 'Meal already in favorites' });
      }

      // Add the new favorite recipe
      const newFavorite = new FavoriteRecipe({
        mealId,
        mealName,
        imageUrl,
      });
      await newFavorite.save();

      return res.status(200).json({ message: 'Meal added to favorites' });
    } catch (error) {
      console.error('Error adding favorite meal:', error);
      return res.status(500).json({ message: 'Error adding favorite meal' });
    }
  }

  if (req.method === 'DELETE') {
    const { mealId } = req.body;

    try {
      // Remove the meal from favorites
      await FavoriteRecipe.deleteOne({ mealId });
      return res.status(200).json({ message: 'Meal removed from favorites' });
    } catch (error) {
      console.error('Error removing favorite meal:', error);
      return res.status(500).json({ message: 'Error removing favorite meal' });
    }
  }

  // If the method is not handled
  res.status(405).json({ message: 'Method Not Allowed' });
}
