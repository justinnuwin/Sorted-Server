# curl --data-binary @can.jpeg http://localhost:8000/label?malformed=true
curl -H "Content-Type: image/jpeg" --data-binary @can.jpeg http://localhost:8000/label?location=123.123,456.456 
# curl -d @can.jpeg.base64  http://localhost:8000/label?location=123.123,456.456
