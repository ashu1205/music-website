const Song=require('../models/song')
const User=require('../models/user')
const MAX_COUNT=20

async function getAllSongs(req,res){
    try {
        const songs=await Song.find({});
        res.json(songs);
    } catch (error) {
        console.log(error);
    }
}
async function getSongByCategory(req,res){
    try {
        const category=req.params.category;

        const songs=await Song.find({genre:category});

        res.json(songs);
    } catch (error) {
        console.log(error);
    }
}
async function playSong(req,res){
    try {
        const userid=req.user.userid;
        const songid=req.params.songid;

        addRecentlyPlayed(userid,songid)
        addMostPlayed(userid,songid)

        return res.status(200).json({
            message:"user playlist updated"
        })
    } catch (error) {
        return res.status(500).json({
            message:"could not update user playlist",
            error:message.error
        })
    }
}
async function addRecentlyPlayed(userid,songid){
    try {
        const user=await User.findById({_id:userid})

        const newEntry = {
            songId: songId,
            playedAt: new Date() 
        };

        
        user.recentlyPlayed.shift(newEntry);
        

        if(user.recentlyPlayed.length >MAX_COUNT){
            user.recentlyPlayed=user.recentlyPlayed.slice(0,MAX_COUNT)
        }
        
        await user.save()

        console.log('song added to Recently played successfully.');
    } catch (error) {
        console.log("internal server error");
        console.log(error.message);
    }
}
async function addMostPlayed(userid, songid) {
    try {
        const user = await User.findById(userid);
        const existingEntryIndex = user.mostPlayed.findIndex(entry => entry.songid.equals(songid));

        if (existingEntryIndex !== -1) {
            user.mostPlayed[existingEntryIndex].playCount++;
        } else {
            user.mostPlayed.push({
                songid: songid,
                playCount: 1
            });
        }

        await user.save();
        console.log('Song added to most played successfully.');
    } catch (error) {
        console.error('Error adding song to most played:', error);
        throw error;
    }
}
async function getMostPlayed(req, res) {
    try {
        const userid = req.user.userid;
        const user = await User.findById(userid).populate('mostPlayed.songId');;
        const mostPlayed = user.mostPlayed.sort((a, b) => b.playCount - a.playCount);
        res.json({ data: mostPlayed });

    } catch (error) {
        console.error('Error fetching most played songs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


async function getRecentlyPlayed(req,res){
    try {
        const userid=req.user.userid;

        // console.log("entered");
        const playlist = await User.findById(userid).select('recentlyPlayed')
        .populate('recentlyPlayed.songId')
        .sort({ 'recentlyPlayed.playedAt': -1 });
        
        // console.log("out");
        res.json({
            data:playlist
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}
async function addToFavourites(req,res){
    try {
        const userid=req.user.userid;
        const songid=req.params.songid;
        const user=await User.findById(userid);

        user.favourites.push(songid)
        await user.save()

        res.status(400).json({
            success:true,
            message:"added to favourites"
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

async function getFavourites(req,res){
    try {
        const userid=req.user.userid;
        
        const favorites=await User.findById(userid).select('favourites').populate('favourites');

        res.status(400).json({
            success:true,
            message:"favourites fetched successfully",
            data:favorites
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

async function search(req,res){
    try {
        const query = req.query.q; 

        const songs = await Song.find({
            $or: [
                { title: { $regex: new RegExp(query, 'i') } },
                { artist: { $regex: new RegExp(query, 'i') }},
                { genre:{ $regex: new RegExp(query, 'i') }}
            ]
        });
        res.json(songs); 
    } catch (error) {
        console.error('error in searching :', error);
        res.status(500).json({
            error:error.message
        });
    }
}

module.exports={getAllSongs,getSongByCategory,playSong,getRecentlyPlayed,getMostPlayed,addToFavourites,getFavourites,search}