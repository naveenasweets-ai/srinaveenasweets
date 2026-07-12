export default function Contact() {
  const lat = 16.327911;
  const lon = 80.437895;

  const mapSrc = `https://maps.google.com/maps?q=${lat},${lon}&hl=es;&output=embed`;

  return (
    <div className="my-4">
      <div
        className={`text-gray-600 body-font relative ${
          window.innerWidth > 768 ? '' : 'flex flex-col-reverse gap-6'
        }`}
      >
        <div className={`h-[60vh] inset-0 bg-gray-300`}>
          <iframe
            src={mapSrc}
            id="iframeId"
            height="100%"
            width="100%"
            frameBorder="0"
            title="map"
            scrolling="no"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
