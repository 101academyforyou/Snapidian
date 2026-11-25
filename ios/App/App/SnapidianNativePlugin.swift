import Foundation
import UIKit
import Vision
import Capacitor
#if canImport(FoundationModels)
import FoundationModels
#endif

/// Native features for the Snapidian iOS app, called from the web app as `Capacitor.Plugins.SnapidianNative`.
/// - recognizeText: on-device text recognition with Apple's Vision framework (Chinese, Japanese, English).
/// - aiStatus / organize: Apple's on-device language model (Apple Intelligence, iOS 26+), used to write a
///   note's title, summary and tags from the recognized text. Nothing leaves the device.
@objc(SnapidianNativePlugin)
public class SnapidianNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SnapidianNativePlugin"
    public let jsName = "SnapidianNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "recognizeText", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "aiStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "organize", returnType: CAPPluginReturnPromise)
    ]

    @objc func recognizeText(_ call: CAPPluginCall) {
        guard let base64 = call.getString("image"),
              let data = Data(base64Encoded: base64),
              let image = UIImage(data: data),
              let cgImage = image.cgImage else {
            call.reject("invalid image")
            return
        }
        let request = VNRecognizeTextRequest { request, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            let observations = request.results as? [VNRecognizedTextObservation] ?? []
            let lines = observations.compactMap { $0.topCandidates(1).first?.string }
            call.resolve(["text": lines.joined(separator: "\n")])
        }
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        // Ask only for languages this device supports; an unsupported one makes the request fail.
        let wanted = ["zh-Hant", "zh-Hans", "ja-JP", "en-US"]
        let supported = (try? request.supportedRecognitionLanguages()) ?? []
        let languages = wanted.filter { supported.contains($0) }
        if !languages.isEmpty { request.recognitionLanguages = languages }

        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc func aiStatus(_ call: CAPPluginCall) {
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            if case .available = SystemLanguageModel.default.availability {
                call.resolve(["state": "available"])
            } else {
                call.resolve(["state": "unavailable"])
            }
            return
        }
        #endif
        call.resolve(["state": "unsupported"])
    }

    @objc func organize(_ call: CAPPluginCall) {
        let prompt = call.getString("prompt") ?? ""
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            Task {
                do {
                    let session = LanguageModelSession()
                    let response = try await session.respond(to: prompt)
                    call.resolve(["text": response.content])
                } catch {
                    call.reject(error.localizedDescription)
                }
            }
            return
        }
        #endif
        call.reject("unsupported")
    }
}
