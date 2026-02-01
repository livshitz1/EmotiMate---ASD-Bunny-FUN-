using UnityEngine;
using System.Collections;
using UnityEngine.Android;

public class GPSManager : MonoBehaviour
{
    public static GPSManager Instance { get; private set; }
    
    [Header("Current Coordinates")]
    public float latitude;
    public float longitude;
    public bool isLocationReady = false;

    private void Awake()
    {
        // יצירת Singleton כדי ש-BunnyARController יוכל לגשת לנתונים
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    IEnumerator Start()
    {
        // בקשת הרשאות מיקום במובייל
        #if UNITY_IOS || UNITY_ANDROID
        if (!Permission.HasUserAuthorizedPermission(Permission.FineLocation))
        {
            Permission.RequestUserPermission(Permission.FineLocation);
            yield return new WaitForSeconds(1);
        }
        #endif

        // בדיקה אם ה-GPS מופעל במכשיר
        if (!Input.location.isEnabledByUser)
        {
            Debug.Log("GPS is not enabled on this device");
            yield break;
        }

        // התחלת שירות המיקום
        Input.location.Start(10f, 10f); 

        int maxWait = 20;
        while (Input.location.status == LocationServiceStatus.Initializing && maxWait > 0)
        {
            yield return new WaitForSeconds(1);
            maxWait--;
        }

        if (maxWait < 1 || Input.location.status == LocationServiceStatus.Failed)
        {
            Debug.Log("Unable to determine device location");
            yield break;
        }

        isLocationReady = true;
    }

    void Update()
    {
        // עדכון קואורדינטות בזמן אמת
        if (isLocationReady && Input.location.status == LocationServiceStatus.Running)
        {
            latitude = Input.location.lastData.latitude;
            longitude = Input.location.lastData.longitude;
        }
    }
}
