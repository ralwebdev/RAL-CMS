import express from 'express';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../controllers/campaignController.js';

const router = express.Router();

router.route('/')
  .get(getCampaigns)
  .post(createCampaign);

router.route('/:id')
  .put(updateCampaign)
  .delete(deleteCampaign);

export default router;
