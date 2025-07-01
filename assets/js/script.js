document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const totalCaloriesInput = document.getElementById('totalCalories');
    const targetPInput = document.getElementById('targetProtein');
    const targetFInput = document.getElementById('targetFat');
    const targetCInput = document.getElementById('targetCarbs');
    const calculateBtn = document.getElementById('calculateBtn');
    const presetPFCBalancedBtn = document.getElementById('presetPFCBalanced');
    const presetPFCLowCarbBtn = document.getElementById('presetPFCLowCarb');
    const distMorningSlider = document.getElementById('distMorningSlider');
    const distLunchSlider = document.getElementById('distLunchSlider');
    const distDinnerSlider = document.getElementById('distDinnerSlider');
    const distMorningVal = document.getElementById('distMorningVal');
    const distLunchVal = document.getElementById('distLunchVal');
    const distDinnerVal = document.getElementById('distDinnerVal');
    const presetDistEvenBtn = document.getElementById('presetDistEven');
    const presetDistMorningBtn = document.getElementById('presetDistMorning');
    const presetDistLunchBtn = document.getElementById('presetDistLunch');
    const presetDistDinnerBtn = document.getElementById('presetDistDinner');

    const G_PER_PROTEIN = 100 / 23, G_PER_FAT = 1, G_PER_CARBS = 100 / 37;

    calculateBtn.addEventListener('click', calculateGuidelines);
    presetPFCBalancedBtn.addEventListener('click', () => setTargetPFC(30, 10, 60));
    presetPFCLowCarbBtn.addEventListener('click', () => setTargetPFC(30, 50, 20));
    presetDistEvenBtn.addEventListener('click', () => setDistribution(33.3, 33.3));
    presetDistMorningBtn.addEventListener('click', () => setDistribution(30, 30));
    presetDistLunchBtn.addEventListener('click', () => setDistribution(40, 30));
    presetDistDinnerBtn.addEventListener('click', () => setDistribution(30, 40));

    const allInputs = [totalCaloriesInput, targetPInput, targetFInput, targetCInput, distLunchSlider, distDinnerSlider];
    allInputs.forEach(input => input.addEventListener('input', saveSettings));

    distLunchSlider.addEventListener('input', (e) => updateDistribution(e));
    distDinnerSlider.addEventListener('input', (e) => updateDistribution(e));

    loadSettings();
    updateDistribution();

    function saveSettings() {
        const settings = {
            calories: totalCaloriesInput.value,
            p: targetPInput.value, f: targetFInput.value, c: targetCInput.value,
            distL: distLunchSlider.value, distD: distDinnerSlider.value,
        };
        localStorage.setItem('gohanCompassSettings', JSON.stringify(settings));
    }

    function loadSettings() {
        const saved = localStorage.getItem('gohanCompassSettings');
        if (saved) {
            const s = JSON.parse(saved);
            totalCaloriesInput.value = s.calories || '';
            targetPInput.value = s.p || '';
            targetFInput.value = s.f || '';
            targetCInput.value = s.c || '';
            distLunchSlider.value = s.distL || 33.3;
            distDinnerSlider.value = s.distD || 33.3;
        }
    }

    function setTargetPFC(p, f, c) {
        targetPInput.value = p; targetFInput.value = f; targetCInput.value = c;
        saveSettings();
    }

    function setDistribution(l, d) {
        distLunchSlider.value = l;
        distDinnerSlider.value = d;
        updateDistribution();
        saveSettings();
    }

    function updateDistribution(event = null) {
        let l = parseFloat(distLunchSlider.value);
        let d = parseFloat(distDinnerSlider.value);

        if (l + d > 100) {
            const triggerId = event ? event.target.id : 'distLunchSlider';
            if (triggerId === 'distLunchSlider') {
                d = 100 - l;
                distDinnerSlider.value = d;
            } else {
                l = 100 - d;
                distLunchSlider.value = l;
            }
        }
        
        let m = 100 - l - d;
        distMorningSlider.value = m;
        distMorningVal.textContent = m.toFixed(1);
        distLunchVal.textContent = l.toFixed(1);
        distDinnerVal.textContent = d.toFixed(1);
    }

    function calculateGuidelines() {
        const totalCalories = parseFloat(totalCaloriesInput.value) || 0;
        const pRatio = parseFloat(targetPInput.value) || 0;
        const fRatio = parseFloat(targetFInput.value) || 0;
        const cRatio = parseFloat(targetCInput.value) || 0;

        if (totalCalories === 0 || (pRatio + fRatio + cRatio) === 0) return;

        const dailyGrams = {
            p: (totalCalories * (pRatio / 100)) / 4,
            f: (totalCalories * (fRatio / 100)) / 9,
            c: (totalCalories * (cRatio / 100)) / 4
        };
        updateDisplay('daily', dailyGrams);

        const dist = {
            m: parseFloat(distMorningSlider.value) / 100,
            l: parseFloat(distLunchSlider.value) / 100,
            d: parseFloat(distDinnerSlider.value) / 100
        };

        ['m', 'l', 'd'].forEach(type => {
            const mealGrams = { p: dailyGrams.p * dist[type], f: dailyGrams.f * dist[type], c: dailyGrams.c * dist[type] };
            const foodGrams = { p: mealGrams.p * G_PER_PROTEIN, f: mealGrams.f * G_PER_FAT, c: mealGrams.c * G_PER_CARBS };
            updateDisplay(type, mealGrams, foodGrams);
        });
    }

    function updateDisplay(prefix, pfcGrams, foodGrams = null) {
        document.getElementById(`${prefix}-p`).textContent = pfcGrams.p.toFixed(1);
        document.getElementById(`${prefix}-f`).textContent = pfcGrams.f.toFixed(1);
        document.getElementById(`${prefix}-c`).textContent = pfcGrams.c.toFixed(1);

        if (foodGrams) {
            document.getElementById(`${prefix}-food-p`).textContent = foodGrams.p.toFixed(1);
            document.getElementById(`${prefix}-food-f`).textContent = foodGrams.f.toFixed(1);
            document.getElementById(`${prefix}-food-c`).textContent = foodGrams.c.toFixed(1);
        }
    }
});
