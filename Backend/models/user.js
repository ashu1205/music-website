const mongoose= require('mongoose');

const userSchema=new mongoose.Schema({
      email:{
            type:String,
            trim:true,
            required:true
      },
      name:{
            type:String,
            trim:true,
            required:true
      },
      password:{
            type:String,
            trim:true,
      },
      recentlyPlayed:[
            {
                  songId: {
                      type: mongoose.Schema.Types.ObjectId,
                      ref: 'Song'
                  },
                  playedAt: {
                      type: Date,
                      default: Date.now
                  }
              }
      ],
      mostPlayed:[
            {
                  songId:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:'Song'
                  },
                  playCount:{
                        type:Number,
                        default:0
                  }

            }
      ],
      favourites:[
            {
                  type:mongoose.Schema.Types.ObjectId,
                  ref:'Song'
            }
      ]

});


module.exports=mongoose.model('User',userSchema);;