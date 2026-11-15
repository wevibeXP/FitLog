import CoreMotion
import ExpoModulesCore

public class FitlogMotionModule: Module {
  private let pedometer = CMPedometer()

  public func definition() -> ModuleDefinition {
    Name("FitlogMotion")

    Events("onPedometerUpdate", "onPedometerError")

    Function("getCapabilities") { () -> [String: Any] in
      let authorizationStatus: String
      switch CMPedometer.authorizationStatus() {
      case .notDetermined:
        authorizationStatus = "notDetermined"
      case .restricted:
        authorizationStatus = "restricted"
      case .denied:
        authorizationStatus = "denied"
      case .authorized:
        authorizationStatus = "authorized"
      @unknown default:
        authorizationStatus = "unknown"
      }

      return [
        "stepCounting": CMPedometer.isStepCountingAvailable(),
        "distance": CMPedometer.isDistanceAvailable(),
        "floorCounting": CMPedometer.isFloorCountingAvailable(),
        "pace": CMPedometer.isPaceAvailable(),
        "cadence": CMPedometer.isCadenceAvailable(),
        "authorizationStatus": authorizationStatus
      ]
    }

    AsyncFunction("queryPedometerData") { (startTimestampMs: Double, endTimestampMs: Double, promise: Promise) in
      guard CMPedometer.isStepCountingAvailable() else {
        promise.reject("E_PEDOMETER_UNAVAILABLE", "Step counting is unavailable on this iPhone.")
        return
      }

      let startDate = Date(timeIntervalSince1970: startTimestampMs / 1000.0)
      let endDate = Date(timeIntervalSince1970: endTimestampMs / 1000.0)

      self.pedometer.queryPedometerData(from: startDate, to: endDate) { [weak self] data, error in
        if let error = error {
          promise.reject("E_PEDOMETER_QUERY", error.localizedDescription)
          return
        }
        guard let self = self, let data = data else {
          promise.resolve(["steps": 0])
          return
        }
        promise.resolve(self.serialize(data))
      }
    }

    Function("startUpdates") { (startTimestampMs: Double) -> Bool in
      guard CMPedometer.isStepCountingAvailable() else {
        return false
      }

      self.pedometer.stopUpdates()
      let startDate = Date(timeIntervalSince1970: startTimestampMs / 1000.0)
      self.pedometer.startUpdates(from: startDate) { [weak self] data, error in
        guard let self = self else {
          return
        }
        if let error = error {
          self.sendEvent("onPedometerError", ["message": error.localizedDescription])
          return
        }
        guard let data = data else {
          return
        }
        self.sendEvent("onPedometerUpdate", self.serialize(data))
      }
      return true
    }

    Function("stopUpdates") {
      self.pedometer.stopUpdates()
    }

    OnDestroy {
      self.pedometer.stopUpdates()
    }
  }

  private func serialize(_ data: CMPedometerData) -> [String: Any] {
    var result: [String: Any] = [
      "steps": data.numberOfSteps.intValue
    ]

    if let distance = data.distance {
      result["distanceMeters"] = distance.doubleValue
    } else {
      result["distanceMeters"] = NSNull()
    }

    if let floors = data.floorsAscended {
      result["floorsAscended"] = floors.intValue
    } else {
      result["floorsAscended"] = NSNull()
    }

    if let floors = data.floorsDescended {
      result["floorsDescended"] = floors.intValue
    } else {
      result["floorsDescended"] = NSNull()
    }

    if let pace = data.currentPace {
      result["currentPaceSecondsPerMeter"] = pace.doubleValue
    } else {
      result["currentPaceSecondsPerMeter"] = NSNull()
    }

    if let pace = data.averageActivePace {
      result["averageActivePaceSecondsPerMeter"] = pace.doubleValue
    } else {
      result["averageActivePaceSecondsPerMeter"] = NSNull()
    }

    if let cadence = data.currentCadence {
      result["currentCadenceStepsPerSecond"] = cadence.doubleValue
    } else {
      result["currentCadenceStepsPerSecond"] = NSNull()
    }

    return result
  }
}
