import connectToDatabase from '../../lib/mongodb';
import FavoriteRecipe from '../../models/FavoriteRecipe';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
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
      const existingMeal = await FavoriteRecipe.findOne({ mealId });
      if (existingMeal) {
        return res.status(400).json({ message: 'Meal already in favorites' });
      }

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
      const result = await FavoriteRecipe.deleteOne({ mealId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Meal not found in favorites' });
      }
      return res.status(200).json({ message: 'Meal removed from favorites' });
    } catch (error) {
      console.error('Error removing favorite meal:', error);
      return res.status(500).json({ message: 'Error removing favorite meal' });
    }
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}
