function setupCam() {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(mediaStream => {
    document.querySelector('#webcamVideo').srcObject = mediaStream;
    track_face()
  }).catch((error) => {
    console.warn(error);
  });
}

setupCam();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function track_face() {
  await tf.setBackend('webgl');
  console.log(tf.getBackend());
  let blinks = 0;
  let bpm = 0;
  // const canvas = document.getElementById("canv");
  const frame = document.getElementById("webcamVideo");
  const counter= document.getElementById("counter")

  // Load the MediaPipe facemesh model.
  const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
  await sleep(5000);
  const video = document.querySelector("video");
  document.getElementById("Loading").style.display = "none";

  
  var last_blinked = 0;
  var start_time = new Date().getTime()
  while(true){
      var faces = await model.estimateFaces({ input: video });

      
      faces.forEach(face => {
          const start = face.boundingBox.topLeft;
          const end = face.boundingBox.bottomRight;
          const size = [end[0] - start[0], end[1] - start[1]];



          var mesh = face.mesh;
          const left = [-1,33,160,158,133,153,144]
          var EAR_LEFT = (Math.abs(mesh[left[2]][0]-mesh[left[6]][0]) + Math.abs(mesh[left[3]][0] -mesh[left[5]][0]))/(2 * Math.abs(mesh[left[1]][1]- mesh[left[4]][1]))
          const right = [-1,362,385,387,263,373,380]
          var EAR_RIGHT = (Math.abs(mesh[right[2]][0]-mesh[right[6]][0]) + Math.abs(mesh[right[3]][0] -mesh[right[5]][0]))/(2 * Math.abs(mesh[right[1]][1]- mesh[right[4]][1]))
          // console.log(EAR_LEFT)
          // console.log(EAR_RIGHT)
          
          
          var time_now = new Date().getTime()
          document.getElementById("counter").innerHTML = "Blinks: " + blinks;
          var mins = ((time_now-start_time)/1000)/60;
          bpm = Math.round(blinks/mins);
          document.getElementById("bpm").innerHTML = "Average Blinks/Minute: " + bpm;

          if(bpm > 15){
            document.getElementById("fatigue").innerHTML = "Normal Blink Rate";
          }
          else if(bpm > 9){
            document.getElementById("fatigue").innerHTML = "Okay Blink Rate";
          }else{
            document.getElementById("fatigue").innerHTML = "Risk Of Fatigue";
          }
          const timeOut = 300;
          if(EAR_LEFT < 0.8 && EAR_RIGHT < 0.8 && (time_now - last_blinked)>timeOut){
              blinks++;
              last_blinked = new Date().getTime();
          }
      });
      await tf.nextFrame();
  }
}




