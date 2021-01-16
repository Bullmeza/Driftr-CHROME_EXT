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



async function track_face() {
  await tf.setBackend('webgl');
  console.log(tf.getBackend());
  let blinks = 0;
  // const canvas = document.getElementById("canv");
  const frame = document.getElementById("webcamVideo");
  const counter= document.getElementById("counter")

  // Load the MediaPipe facemesh model.
  const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
  const video = document.querySelector("video");

  
  var last_blinked = 0;
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
          console.log(time_now + " " + last_blinked)
          const timeOut = 150;
          if(EAR_LEFT < 0.8 && EAR_RIGHT < 0.8 && (time_now - last_blinked)>timeOut){
              blinks++;
              document.getElementById("counter").innerHTML = "Blinks: " + blinks;
              last_blinked = new Date().getTime();
          }
      });
      await tf.nextFrame();
  }
}




