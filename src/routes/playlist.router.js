import { Router } from 'express';
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"
import { verifyjwt } from '../middlewares/auth.middleware.js';
const router=Router();
router.use(verifyjwt)
//isme pagination krna baad mei
router.route("/create-Playlist").post(createPlaylist)
router.route("/user-playlist/:userId").get(getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById)
router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist)
router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist)
router.route("/:playlistId").delete(deletePlaylist)
router.route("/update/:playlistId").patch(updatePlaylist)
export default router;