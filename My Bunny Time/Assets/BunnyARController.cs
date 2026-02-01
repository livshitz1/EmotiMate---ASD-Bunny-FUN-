using UnityEngine;

public class BunnyARController : MonoBehaviour
{
    public GameObject bunnyPrefab; // גרור לכאן את מודל הארנב שלך
    public float detectionRadius = 100f; // רדיוס של 100 מטר מהיעד
    
    // נקודות ציון שהגיעו מהאפליקציה (Settings)
    private float targetLat;
    private float targetLon;
    private bool hasSpawned = false;

    void Start()
    {
        // קבלת הנתונים ששמרנו ב-Settings של האפליקציה
        targetLat = PlayerPrefs.GetFloat("SchoolLat", 0f);
        targetLon = PlayerPrefs.GetFloat("SchoolLon", 0f);

        #if !UNITY_EDITOR && UNITY_IOS
            Application.ExternalCall("onUnityReady"); 
        #endif
    }

    void Update()
    {
        if (GPSManager.Instance != null && GPSManager.Instance.isLocationReady && !hasSpawned)
        {
            float distance = CalculateDistance(
                GPSManager.Instance.latitude, 
                GPSManager.Instance.longitude, 
                targetLat, 
                targetLon
            );

            if (distance <= detectionRadius)
            {
                SpawnBunny();
            }
        }
    }

    void SpawnBunny()
    {
        Instantiate(bunnyPrefab, new Vector3(0, 0, 2), Quaternion.identity);
        hasSpawned = true;
        Debug.Log("הגענו ליעד! הארנב מופיע ב-AR.");
    }

    // נוסחה לחישוב מרחק בין שתי נקודות GPS (במטרים)
    float CalculateDistance(float lat1, float lon1, float lat2, float lon2)
    {
        float R = 6371000; 
        float dLat = (lat2 - lat1) * Mathf.Deg2Rad;
        float dLon = (lon2 - lon1) * Mathf.Deg2Rad;
        float a = Mathf.Sin(dLat / 2) * Mathf.Sin(dLat / 2) +
                  Mathf.Cos(lat1 * Mathf.Deg2Rad) * Mathf.Cos(lat2 * Mathf.Deg2Rad) *
                  Mathf.Sin(dLon / 2) * Mathf.Sin(dLon / 2);
        float c = 2 * Mathf.Atan2(Mathf.Sqrt(a), Mathf.Sqrt(1 - a));
        return R * c;
    }
}
