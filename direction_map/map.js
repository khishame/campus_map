mapboxgl.accessToken = 'pk.eyJ1Ijoia2hpc2hhIiwiYSI6ImNtOWdvb3o2eDE1cHMybnNhM3BwYXYzYzQifQ.J1It4AHUyB1NGANTKikThw'; 

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/khisha/cma1esjau00qp01s56heff941',
    zoom: 15.56,
    center: [28.096165, -25.540288]
});

// === GEOCODER (used only for visual box, not data) ===
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
    placeholder: "Search campus locations..."
});
map.addControl(geocoder, 'top-left');

// === NAVIGATION & DIRECTIONS ===
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
const directions = new MapboxDirections({ accessToken: mapboxgl.accessToken });

// === GPS (Geolocation) Control ===
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    }),
    'bottom-right'
);

function direction_reset() {
    directions.actions.clearOrigin();
    directions.actions.clearDestination();
    directions.container.querySelector('input').value = '';
}

$(function () {
    $('#get-direction').click(function () {
        map.addControl(directions, 'top-left');
        directions.container.setAttribute('id', 'direction-container');
        $(geocoder.container).hide();
        $(this).hide();
        $('#end-direction').removeClass('d-none');
        $('.marker').remove();
    });
    $('#end-direction').click(function () {
        direction_reset();
        $(this).addClass('d-none');
        $('#get-direction').show();
        $(geocoder.container).show();
        map.removeControl(directions);
    });
});

// === CUSTOM SEARCH IMPLEMENTATION ===
let pointFeaturesByName = {};
let markers = [];
let popups = [];

map.on('load', function () {
    geocoder.container.setAttribute('id', 'geocoder-search');

    // === Suggestion dropdown setup ===
    const suggestionBox = document.createElement('ul');
    suggestionBox.id = 'suggestions';
    Object.assign(suggestionBox.style, {
        position: 'absolute',
        zIndex: 1000,
        background: '#fff',
        listStyle: 'none',
        margin: 0,
        padding: '5px',
        border: '1px solid #ccc',
        width: '100%',
        maxHeight: '150px',
        overflowY: 'auto',
        display: 'none'
    });
    document.querySelector('#geocoder-search').appendChild(suggestionBox);

    // Store all searchable features by lowercase name
    const features = map.querySourceFeatures('composite', { sourceLayer: 'points' });
    features.forEach(f => {
        const name = f.properties.name?.toLowerCase();
        if (name) pointFeaturesByName[name] = f;
    });

    const inputField = document.querySelector('#geocoder-search input');

    inputField.addEventListener('input', function (e) {
        const input = e.target.value.toLowerCase().trim();
        suggestionBox.innerHTML = '';
        suggestionBox.style.display = 'none';

        if (input.length === 0) return;

        const matches = Object.keys(pointFeaturesByName).filter(k => k.includes(input));
        if (matches.length === 0) return;

        matches.forEach(match => {
            const li = document.createElement('li');
            li.textContent = pointFeaturesByName[match].properties.name;
            Object.assign(li.style, {
                padding: '5px',
                cursor: 'pointer'
            });
            li.addEventListener('click', () => {
                showFeaturePopup(match);
                inputField.value = '';
                suggestionBox.innerHTML = '';
                suggestionBox.style.display = 'none';
            });
            suggestionBox.appendChild(li);
        });

        suggestionBox.style.display = 'block';
    });

    function showFeaturePopup(key) {
        const feature = pointFeaturesByName[key];
        const coordinates = feature.geometry.coordinates;
        const name = feature.properties.name;
        const description = feature.properties.Description || '';

        let imagePath = '';
        if (name === 'Ruth first hall') imagePath = '/20250505_151350.jpg';
        else if (name === 'Campus Clinic') imagePath = '/20250505_151711.jpg';
        else if (name === 'Student Center') imagePath = '/20250505_151927.jpg';
        else if (name === 'gym') imagePath = '/20250505_151523.jpg';
        else if (name === 'cafateria') imagePath = '/20250505_152407.jpg';
        else if (name === 'TUT FM') imagePath = '/20250505_152307.jpg';
        else if (name === 'One stop') imagePath = '/20250505_152737.jpg';
        else if (name === 'Risidence Aministation') imagePath = '/20250505_152559.jpg';
        else if (name === 'Library') imagePath = '/20250505_153150.jpg';
        else if (name === 'Information Center') imagePath = '/20250505_152917.jpg';
        else if (name === 'Student Adminitration') imagePath = '/20250505_153449.jpg';
        else if (name === 'ICT LAB') imagePath = '/building_10.jpg';
        else if (name === 'Building 12') imagePath = '/bulding_14.jpg';
        else if (name === 'Lecture Parking Area') imagePath = '/Lec_Parking.jpg';
        else if (name === 'Public Parking Area') imagePath = '/Parking.jpg';
        else if (name === 'Bus Terminal') imagePath = '/20250505_154750.jpg';

        // === CLEAR EXISTING MARKERS AND POPUPS ===
        markers.forEach(marker => marker.remove());
        popups.forEach(popup => popup.remove());
        markers = [];
        popups = [];

        map.flyTo({ center: coordinates, zoom: 18 });

        const marker = new mapboxgl.Marker($('<div class="marker"><i class="fa fa-map-marker-alt"></i></div>')[0])
            .setLngLat(coordinates)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                        <h3>${name}</h3>
                        ${imagePath ? `<p><img src="/Photo${imagePath}" style="max-width: 150px; margin-top: 5px; border-radius: 4px;" /></p>` : ''}
                        <p>${description}</p>
                    `)
            )
            .addTo(map);

        markers.push(marker);
        popups.push(marker.getPopup());
    }
});

// === CLICK TO OPEN POPUP (Original logic) ===
map.on('click', (event) => {
    const features = map.queryRenderedFeatures(event.point, {
        layers: ['points']
    });
    if (!features.length) return;

    const feature = features[0];
    const name = feature.properties.name;
    const description = feature.properties.Description || '';
    let imagePath = '';

    if (name === 'Ruth first hall') imagePath = '/20250505_151350.jpg';
    else if (name === 'Campus Clinic') imagePath = '/20250505_151711.jpg';
    else if (name === 'Student Center') imagePath = '/20250505_151927.jpg';
    else if (name === 'gym') imagePath = '/20250505_151523.jpg';
    else if (name === 'cafateria') imagePath = '/20250505_152407.jpg';
    else if (name === 'TUT FM') imagePath = '/20250505_152307.jpg';
    else if (name === 'One stop') imagePath = '/20250505_152737.jpg';
    else if (name === 'Risidence Aministation') imagePath = '/20250505_152559.jpg';
    else if (name === 'Library') imagePath = '/20250505_153150.jpg';
    else if (name === 'Information Center') imagePath = '/20250505_152917.jpg';
    else if (name === 'Student Adminitration') imagePath = '/20250505_153449.jpg';
    else if (name === 'ICT LAB') imagePath = '/building_10.jpg';
    else if (name === 'Building 12') imagePath = '/bulding_14.jpg';
    else if (name === 'Lecture Parking Area') imagePath = '/Lec_Parking.jpg';
    else if (name === 'Public Parking Area') imagePath = '/Parking.jpg';
    else if (name === 'Bus Terminal') imagePath = '/20250505_154750.jpg';

    new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`
            <h3>${name}</h3>
            ${imagePath ? `<p><img src="/Photo${imagePath}" style="max-width: 150px; margin-top: 5px; border-radius: 4px;" /></p>` : ''}
            <p>${description}</p>
        `)
        .addTo(map);
});

// === CURSOR FEEDBACK ===
map.on('mouseenter', 'points', () => map.getCanvas().style.cursor = 'pointer');
map.on('mouseleave', 'points', () => map.getCanvas().style.cursor = '');
