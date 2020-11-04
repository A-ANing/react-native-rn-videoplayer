
Pod::Spec.new do |s|
  s.name         = "RNIndicator"
  s.version      = "1.0.0"
  s.summary      = "RNIndicator"
  s.description  = <<-DESC
                  RNIndicator
                   DESC
  s.homepage     = "https://github.com/A-ANing/react-native-rn-videoplayer"
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/A-ANing/react-native-rn-videoplayer.git", :tag => "master" }
  s.source_files  = "ios/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

  