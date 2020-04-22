import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { log } from 'console';
import { readdir } from 'fs';
import { Request, Response } from 'express';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  //app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage",async(req: Request,res: Response)=>{
    var url:string = req.query.image_url;
    if(url){
      const filteredPath:string = await filterImageFromURL(url);
      if(filteredPath){
        res.status(200).sendFile(filteredPath);
        const tmp_dir:string = __dirname+"/util/tmp";
        
        readdir(tmp_dir,(err,files)=>{
          if(err){
            console.log("Error reading tmp dir : "+tmp_dir);
          }else{
            try{
              deleteLocalFiles(files,tmp_dir);
              console.log(`Cleared tmp folder! Removed ${files.length} files`);
            }catch(e){
              console.log("Error deleting files :"+e);
            }
          }
        });
      }else{
        res.status(422).send("No valid image found at URL ==> "+url);
      }
    }else{
      res.status(400).send("image_url is required");
    }
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req:Request, res:Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();